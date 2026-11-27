/**
 * Stackra file contract:
 * Purpose: tests of .github/scripts/stackra-catalog.mjs: catalog `stackra` is parsed strictly, each entry moves to its
 *          own package's `latest` and never backwards, a deprecated or unreadable `latest` is an error, only the moving
 *          versions are rewritten, and the proposal (branch, title, body) is stable and a valid commit subject.
 * Boundary: the pure functions; the npm reads and the pull request run in .github/workflows/catalog-latest.yml.
 * Runtime: node (`node --test ".github/scripts/__tests__/*.test.mjs"`, the `scripts` check of preview-gate.mjs)
 * Governing contract: Stackra ADR 0013 (exact catalog pins), ADR 0019, ADR 0515 decision 3. STA-2884.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { STACKRA_CATALOG } from "../stackra-catalog.mjs";

const {
  BRANCH_PREFIX,
  stackraCatalog,
  compareVersions,
  latestOf,
  plan,
  applyMoves,
  proposal,
  summary,
} = STACKRA_CATALOG;

const WORKSPACE = [
  "packages:",
  "  - apps/*",
  "catalogs:",
  "  # Stackra framework packages.",
  "  stackra:",
  '    "@stackra/app": 0.15.0',
  "    # the CLI",
  '    "@stackra/cli": 0.15.0',
  "",
  '    "@stackra/zeta": 0.40.0',
  "  default:",
  '    "@stackra/cli": 9.9.9',
  "    react: 19.2.3",
  "",
].join("\n");

/** A `npm view <name>@latest --json` success. */
const view = (name, version, extra = {}) => ({
  status: 0,
  stdout: JSON.stringify({ name, version, "dist-tags": { latest: version }, ...extra }),
});

test("the catalog is the stackra block only, comments and blank lines skipped", () => {
  assert.deepEqual(stackraCatalog(WORKSPACE), [
    { name: "@stackra/app", version: "0.15.0", line: 5 },
    { name: "@stackra/cli", version: "0.15.0", line: 7 },
    { name: "@stackra/zeta", version: "0.40.0", line: 9 },
  ]);
});

test("the template's own pnpm-workspace.yaml parses, with @stackra/cli in it", () => {
  const text = readFileSync(new URL("../../../pnpm-workspace.yaml", import.meta.url), "utf8");
  const entries = stackraCatalog(text);
  assert.ok(entries.length > 10);
  assert.ok(entries.some(({ name }) => name === "@stackra/cli"));
});

test("a missing block, a range, a foreign package or a duplicate is refused", () => {
  assert.throws(() => stackraCatalog("packages:\n  - apps/*\n"), /no catalogs.stackra block/);
  assert.throws(() => stackraCatalog("catalogs:\n  stackra:\n  default:\n"), /is empty/);
  assert.throws(
    () => stackraCatalog('catalogs:\n  stackra:\n    "@stackra/app": ^0.15.0\n'),
    /not an exact/,
  );
  assert.throws(
    () => stackraCatalog('catalogs:\n  stackra:\n    "react": 19.2.3\n'),
    /not an exact/,
  );
  assert.throws(
    () =>
      stackraCatalog('catalogs:\n  stackra:\n    "@stackra/a": 1.0.0\n    "@stackra/a": 1.0.1\n'),
    /twice/,
  );
});

test("versions compare by semver precedence", () => {
  assert.ok(compareVersions("0.33.1", "0.33.0") > 0);
  assert.ok(compareVersions("0.33.0", "0.15.0") > 0);
  assert.ok(compareVersions("0.10.0", "0.9.9") > 0);
  assert.equal(compareVersions("1.2.3", "1.2.3"), 0);
  assert.ok(compareVersions("1.0.0-next.1", "1.0.0") < 0);
  assert.ok(compareVersions("1.0.0-next.10", "1.0.0-next.9") > 0);
  assert.ok(compareVersions("1.0.0-alpha", "1.0.0-alpha.1") < 0);
  assert.ok(compareVersions("1.0.0-1", "1.0.0-alpha") < 0);
  assert.throws(() => compareVersions("^1.0.0", "1.0.0"), TypeError);
});

test("latest is read from the dist-tag; an error or odd answer is an error, never a version", () => {
  assert.deepEqual(latestOf(view("@stackra/cli", "0.33.1"), "@stackra/cli"), {
    version: "0.33.1",
    deprecated: undefined,
  });
  assert.equal(
    latestOf(view("@stackra/cli", "0.33.1", { deprecated: "partial" }), "@stackra/cli").deprecated,
    "partial",
  );
  const errors = [
    { status: 1, stdout: JSON.stringify({ error: { code: "E404", summary: "Not Found" } }) },
    { status: 1, stdout: JSON.stringify({ error: { code: "ENOTFOUND", summary: "getaddrinfo" } }) },
    { status: 1, stdout: "" },
    { status: 0, stdout: "not json" },
    {
      status: 0,
      stdout: JSON.stringify({
        name: "@stackra/other",
        version: "1.0.0",
        "dist-tags": { latest: "1.0.0" },
      }),
    },
    {
      status: 0,
      stdout: JSON.stringify({ name: "@stackra/cli", version: "1.0.0", "dist-tags": {} }),
    },
    {
      status: 0,
      stdout: JSON.stringify({
        name: "@stackra/cli",
        version: "1.0.0",
        "dist-tags": { latest: "2.0.0" },
      }),
    },
    { error: new Error("spawnSync npm ENOENT") },
  ];
  for (const run of errors) assert.ok(latestOf(run, "@stackra/cli").error, JSON.stringify(run));
});

test("each entry moves to its own latest, a pin ahead of latest is held, an equal one stays", () => {
  const latest = new Map([
    ["@stackra/app", { version: "0.33.0" }],
    ["@stackra/cli", { version: "0.33.1" }],
    ["@stackra/zeta", { version: "0.33.1" }],
  ]);
  assert.deepEqual(plan(stackraCatalog(WORKSPACE), latest), {
    moves: [
      { name: "@stackra/app", from: "0.15.0", to: "0.33.0" },
      { name: "@stackra/cli", from: "0.15.0", to: "0.33.1" },
    ],
    held: [{ name: "@stackra/zeta", pinned: "0.40.0", latest: "0.33.1" }],
    errors: [],
  });
  const same = new Map([
    ["@stackra/app", { version: "0.15.0" }],
    ["@stackra/cli", { version: "0.15.0" }],
    ["@stackra/zeta", { version: "0.40.0" }],
  ]);
  assert.deepEqual(plan(stackraCatalog(WORKSPACE), same), { moves: [], held: [], errors: [] });
});

test("an unreadable package, a missing answer or a deprecated latest is an error naming it", () => {
  const latest = new Map([
    ["@stackra/app", { error: "E404: Not Found" }],
    ["@stackra/cli", { version: "0.33.1", deprecated: "partial release" }],
  ]);
  const { errors } = plan(stackraCatalog(WORKSPACE), latest);
  assert.deepEqual(errors, [
    "@stackra/app: E404: Not Found",
    "@stackra/cli@0.33.1 (latest) is deprecated: partial release",
    "@stackra/zeta: not read",
  ]);
});

test("only the moving versions are rewritten; the default catalog's @stackra/cli and every other byte stay", () => {
  const moves = [{ name: "@stackra/cli", from: "0.15.0", to: "0.33.1" }];
  const next = applyMoves(WORKSPACE, moves);
  assert.equal(next, WORKSPACE.replace('    "@stackra/cli": 0.15.0', '    "@stackra/cli": 0.33.1'));
  assert.match(next, /^ {4}"@stackra\/cli": 9\.9\.9$/m);
  assert.throws(
    () => applyMoves(WORKSPACE, [{ name: "@stackra/cli", from: "0.14.0", to: "0.33.1" }]),
    /not pinned/,
  );
  assert.throws(
    () => applyMoves(WORKSPACE, [{ name: "@stackra/nope", from: "0.15.0", to: "0.33.1" }]),
    /not pinned/,
  );
});

test("the proposal is named by its targets and its title is a conventional subject of at most 100 characters", () => {
  const moves = [
    { name: "@stackra/cli", from: "0.15.0", to: "0.33.1" },
    { name: "@stackra/app", from: "0.15.0", to: "0.33.0" },
  ];
  const one = proposal(moves);
  assert.equal(
    one.branch,
    proposal([...moves].reverse()).branch,
    "order does not change the branch",
  );
  assert.notEqual(one.branch, proposal([{ ...moves[0], to: "0.34.0" }, moves[1]]).branch);
  assert.ok(one.branch.startsWith(BRANCH_PREFIX));
  assert.match(one.branch, /^stackra\/catalog-latest-[0-9a-f]{12}$/);
  assert.equal(one.title, "chore(deps): move the @stackra catalog to latest (@stackra/cli 0.33.1)");
  assert.ok(one.title.length <= 100);
  assert.ok(one.message.startsWith(`${one.title}\n\n`));
  for (const line of one.message.split("\n")) assert.ok(line.length <= 100, line);
  assert.equal(
    proposal([moves[1]]).title,
    "chore(deps): move the @stackra catalog to latest (1 package)",
  );
});

test("the body lists every move and every held pin", () => {
  const body = summary({
    moves: [{ name: "@stackra/cli", from: "0.15.0", to: "0.33.1" }],
    held: [{ name: "@stackra/zeta", pinned: "0.40.0", latest: "0.33.1" }],
  });
  assert.match(body, /\| `@stackra\/cli` \| 0\.15\.0 \| 0\.33\.1 \|/);
  assert.match(body, /`@stackra\/zeta` 0\.40\.0 \(latest 0\.33\.1\)/);
  assert.match(body, /Nothing merges on its own/);
});

test("catalog-latest.yml runs the script, opens the PR as the App and never force-pushes or touches main", () => {
  const workflow = readFileSync(
    new URL("../../workflows/catalog-latest.yml", import.meta.url),
    "utf8",
  );
  assert.match(workflow, /^permissions: \{\}$/m);
  assert.match(workflow, /node \.github\/scripts\/stackra-catalog\.mjs --write/);
  assert.match(
    workflow,
    /if ! pnpm install --lockfile-only --no-frozen-lockfile; then\n.*::error[^\n]*\n\s+exit 1/,
  );
  assert.match(workflow, /actions\/create-github-app-token@[0-9a-f]{40} /);
  assert.match(workflow, /GH_TOKEN: \$\{\{ steps\.bot\.outputs\.token \}\}/);
  assert.match(workflow, /push origin "HEAD:refs\/heads\/\$\{BRANCH\}"/);
  assert.doesNotMatch(workflow, /--force|\+HEAD|refs\/heads\/main|gh pr merge|continue-on-error/);
  assert.ok(
    workflow.includes(`startswith(\\"${BRANCH_PREFIX}\\")`),
    "closes only its own superseded PRs",
  );
});
