/**
 * Stackra file contract:
 * Purpose: tests of .github/scripts/test-tiers.mjs: the workspace glob reader, which members have integration tests,
 *          the wiring gaps it reports, and the check itself on this repository (the Quality Gate runs both tiers).
 * Boundary: the pure functions on literal inputs, plus one run of the script against the checked-out tree; no test
 *           runs, no install.
 * Runtime: node (`node --test ".github/scripts/__tests__/*.test.mjs"`, the `scripts` check of preview-gate.mjs)
 * Governing contract: Stackra ADR 0182 (decision 1: the test tiers); Stackra ADR 0239 (decision 1); STA-1570
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { TEST_TIERS } from "../test-tiers.mjs";

const { intTierReason, isMember, tierGaps, workspaceGlobs } = TEST_TIERS;

/** The repository root, two folders above this file. */
const ROOT = fileURLToPath(new URL("../../../", import.meta.url));

/** A service that runs the three packages gen needs for its isolation test. */
const SERVICE = {
  stackra: { tier: "service" },
  dependencies: { "@stackra/database": "catalog:stackra", "@stackra/tenancy": "catalog:stackra" },
  devDependencies: { "@stackra/testing": "catalog:stackra" },
};

/** The wiring the template ships: both root scripts, the turbo task and both gate steps. */
const WIRED = {
  scripts: { test: "turbo run test", "test:int": "turbo run test:int" },
  turbo: '{ "tasks": { "test": {}, "test:int": { "cache": false } } }',
  ci: [
    "      - name: Test",
    "        run: pnpm exec turbo run test ${AFFECTED:+--affected}",
    "      - name: Integration tests",
    "        run: pnpm exec turbo run test:int ${AFFECTED:+--affected}",
  ].join("\n"),
  members: [],
};

test("workspaceGlobs reads the top-level packages list only", () => {
  const yaml = [
    "# comment",
    "packages:",
    "  - apps/*",
    '  - "packages/*/*" # quoted',
    "  - services/*",
    "",
    "catalogMode: strict",
    "  - not/a/member",
  ].join("\n");
  assert.deepEqual(workspaceGlobs(yaml), ["apps/*", "packages/*/*", "services/*"]);
});

test("isMember matches one path segment per star", () => {
  const globs = ["apps/*", "packages/*/*", "services/*"];
  assert.equal(isMember("services/example", globs), true);
  assert.equal(isMember("packages/application/example", globs), true);
  assert.equal(isMember("packages/example", globs), false);
  assert.equal(isMember("services/example/nested", globs), false);
});

test("an authored int test in __tests__ needs the int tier", () => {
  const reason = intTierReason({
    files: ["src/modules/notes/__tests__/note-isolation.int.test.ts"],
    manifest: { stackra: { tier: "service" } },
    read: () => "",
  });
  assert.equal(reason, "it has src/modules/notes/__tests__/note-isolation.int.test.ts");
});

test("a unit test or an int test outside __tests__ does not", () => {
  const reason = intTierReason({
    files: ["src/__tests__/a.test.ts", "src/a.int.test.ts"],
    manifest: {},
    read: () => "",
  });
  assert.equal(reason, undefined);
});

test("a package with its own migrations needs the int tier (gen's migrations check)", () => {
  const reason = intTierReason({
    files: ["src/node/database/migrations/0001-create-things.migration.ts"],
    manifest: { stackra: { tier: "lib" } },
    read: () => "",
  });
  assert.match(reason ?? "", /gen checks its migrations on Postgres/);
});

test("a service with a tenant-owned model needs the int tier (gen's isolation test)", () => {
  const reason = intTierReason({
    files: ["src/modules/notes/models/note.model.ts"],
    manifest: SERVICE,
    read: () => "export class Note extends Model.with(HasPublicId('not'), BelongsToTenant) {}",
  });
  assert.match(
    reason ?? "",
    /tenant-isolation test \(src\/modules\/notes\/models\/note\.model\.ts/,
  );
});

test("a service with only global models, or without tenancy, does not", () => {
  const globalOnly = intTierReason({
    files: ["src/modules/plans/models/plan.model.ts"],
    manifest: SERVICE,
    read: () => "export class Plan extends Model.global(HasPublicId('pln')) {}",
  });
  assert.equal(globalOnly, undefined);
  const noTenancy = intTierReason({
    files: ["src/modules/notes/models/note.model.ts"],
    manifest: { stackra: { tier: "service" }, dependencies: { "@stackra/database": "x" } },
    read: () => "BelongsToTenant",
  });
  assert.equal(noTenancy, undefined);
});

test("the wired repository has no gaps", () => {
  assert.deepEqual(tierGaps(WIRED), []);
});

test("each missing piece of wiring is a gap", () => {
  const gaps = tierGaps({ scripts: {}, turbo: "{}", ci: "", members: [] });
  assert.equal(gaps.length, 5);
  assert.match(gaps[0], /root `test` script/);
  assert.match(gaps[1], /root `test:int` script/);
  assert.match(gaps[2], /no `test:int` task/);
  assert.match(gaps[3], /no unit-test step/);
  assert.match(gaps[4], /no integration-test step/);
});

test("a gate whose test steps are only comments is a gap", () => {
  const ci = "      # run: pnpm exec turbo run test\n      # run: pnpm exec turbo run test:int\n";
  assert.equal(tierGaps({ ...WIRED, ci }).length, 2);
});

/**
 * A member that has an authored int test, with the given scripts.
 * @param scripts - its package.json scripts.
 */
function memberWith(scripts) {
  return {
    folder: "services/example",
    manifest: { scripts },
    reason: "it has src/__tests__/a.int.test.ts",
  };
}

test("a member with int tests but no test:int script is a gap; one with the script is not", () => {
  const gaps = tierGaps({ ...WIRED, members: [memberWith({ test: "stackra test" })] });
  assert.deepEqual(gaps, [
    'services/example/package.json: no `test:int` script although it has src/__tests__/a.int.test.ts; add "test:int": "stackra test --tier int"',
  ]);
  const wired = memberWith({ test: "stackra test", "test:int": "stackra test --tier int" });
  assert.deepEqual(tierGaps({ ...WIRED, members: [wired] }), []);
});

test("this repository runs both tiers in the Quality Gate", () => {
  const result = spawnSync(process.execPath, [".github/scripts/test-tiers.mjs"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /test tiers: wired/);
});
