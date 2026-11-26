#!/usr/bin/env node
/**
 * Stackra file contract:
 * Purpose: the test-tier wiring check, the `tiers` check of preview-gate.mjs: the unit and integration tiers run in
 *          CI, and no member's integration tests are skipped there in silence. It fails when the root `test` or
 *          `test:int` script, the turbo `test:int` task or the Quality Gate's `test` or `test:int` step is missing, and
 *          when a member that has integration tests declares no `test:int` script (turbo runs a task only in the
 *          members that define it, so such a member's tests, gen's tenant-isolation test included, would never run).
 * Boundary: reads tracked files only (git ls-files, the root package.json, turbo.jsonc, .github/workflows/ci.yml and
 *           the members' package.json and model files); it runs no test and edits nothing. A member has integration
 *           tests when it has an authored `src/**\/__tests__/<name>.int.test.ts(x)`, when it is a package with its own
 *           migrations (`src/node/database/migrations/*.migration.ts`, gen writes `.stackra/tests/migrations.int.test.ts`),
 *           or when it is a service that runs @stackra/database, @stackra/tenancy and @stackra/testing and declares a
 *           `BelongsToTenant` or `BelongsToTenantOrPlatform` model (gen writes `.stackra/tests/tenant-isolation.int.test.ts`).
 *           A service that has owned tables only through a package it hosts is not seen here; `stackra gen` still writes
 *           its isolation test.
 * Runtime: node (built-ins only, so it runs before any install)
 * Governing contract: Stackra ADR 0182 (decision 1: the test tiers); Stackra ADR 0239 (decision 1: the tenant-isolation
 *                     test of every service with owned tables); STA-1570 (the integration tier in CI).
 *
 * Usage: `node .github/scripts/test-tiers.mjs` from the repository root.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, posix } from "node:path";
import { pathToFileURL } from "node:url";

/** An authored integration test: `<name>.int.test.ts(x)` inside a `__tests__/` folder under `src/`. */
const AUTHORED_INT_TEST = /^src\/(.+\/)?__tests__\/(.+\/)?[^/]+\.int\.test\.tsx?$/;

/** A package's own migration, which gen checks on a real Postgres (`.stackra/tests/migrations.int.test.ts`). */
const PACKAGE_MIGRATION = /^src\/node\/database\/migrations\/[^/]+\.migration\.ts$/;

/** A model file under `src/`. */
const MODEL_FILE = /^src\/(.+\/)?[^/]+\.model\.ts$/;

/** The `@stackra/tenancy` traits that make a model tenant-owned (gen's SCOPE_OWNER_TRAITS). */
const OWNER_TRAIT = /\bBelongsToTenant(OrPlatform)?\b/;

/** The packages gen needs in a service before it writes the tenant-isolation test. */
const ISOLATION_PACKAGES = ["@stackra/database", "@stackra/tenancy", "@stackra/testing"];

/**
 * The member globs of pnpm-workspace.yaml: the `- <glob>` items of its top-level `packages:` list.
 * @param yaml - the text of pnpm-workspace.yaml.
 * @returns the globs, in file order.
 * @example
 * workspaceGlobs('packages:\n  - apps/*\n  - "services/*"\n'); // ["apps/*", "services/*"]
 */
function workspaceGlobs(yaml) {
  const globs = [];
  let inside = false;
  for (const line of yaml.split("\n")) {
    if (/^packages:\s*$/.test(line)) {
      inside = true;
      continue;
    }
    if (!inside) continue;
    const item = /^\s+-\s+["']?([^"'#\s]+)["']?\s*(#.*)?$/.exec(line);
    if (item) globs.push(item[1]);
    else if (/^\S/.test(line)) break;
  }
  return globs;
}

/**
 * Whether `folder` is matched by a workspace glob (`*` stands for one path segment).
 * @param folder - a repository-relative folder, POSIX separators.
 * @param globs - the workspace globs.
 * @example
 * isMember("services/example", ["services/*"]); // true
 */
function isMember(folder, globs) {
  return globs.some((glob) => {
    const pattern = glob
      .split("/")
      .map((segment) => segment.replaceAll(/[.+?^${}()|[\]\\]/g, "\\$&").replaceAll("*", "[^/]+"))
      .join("/");
    return new RegExp(`^${pattern}$`).test(folder);
  });
}

/**
 * Why a member has integration tests, or undefined when it has none this check can see.
 * @param member - `files`: its tracked files, relative to the member root; `manifest`: its parsed package.json;
 *                 `read(file)`: the text of one of its files.
 * @returns a short reason, for the finding.
 * @example
 * intTierReason({ files: ["src/a/__tests__/a.int.test.ts"], manifest: {}, read: () => "" });
 * // "it has src/a/__tests__/a.int.test.ts"
 */
function intTierReason({ files, manifest, read }) {
  const authored = files.find((file) => AUTHORED_INT_TEST.test(file));
  if (authored) return `it has ${authored}`;
  const tier = manifest.stackra?.tier;
  if (tier !== "service") {
    const migration = files.find((file) => PACKAGE_MIGRATION.test(file));
    if (migration) return `gen checks its migrations on Postgres (${migration})`;
    return undefined;
  }
  const dependencies = { ...manifest.dependencies, ...manifest.devDependencies };
  if (!ISOLATION_PACKAGES.every((name) => name in dependencies)) return undefined;
  const owned = files.find((file) => MODEL_FILE.test(file) && OWNER_TRAIT.test(read(file)));
  return owned ? `gen writes its tenant-isolation test (${owned} is tenant-owned)` : undefined;
}

/**
 * The wiring gaps of the repository.
 * @param repo - `scripts`: the root package.json scripts; `turbo`: the text of turbo.jsonc; `ci`: the text of
 *               .github/workflows/ci.yml; `members`: each member's folder, parsed package.json and int-tier reason.
 * @returns one message per gap, empty when the tiers are wired.
 * @example
 * tierGaps({ scripts: {}, turbo: "", ci: "", members: [] }).length; // 5
 */
function tierGaps({ scripts, turbo, ci, members }) {
  const gaps = [];
  if (!/^turbo run test(\s|$)/.test(scripts.test ?? ""))
    gaps.push('package.json: the root `test` script is not "turbo run test"');
  if (!/^turbo run test:int(\s|$)/.test(scripts["test:int"] ?? ""))
    gaps.push('package.json: the root `test:int` script is not "turbo run test:int"');
  if (!/"test:int"\s*:\s*\{/.test(turbo))
    gaps.push("turbo.jsonc: no `test:int` task, so no member's integration tests run");
  if (!/^\s+run: pnpm exec turbo run test(\s|$)/m.test(ci))
    gaps.push(".github/workflows/ci.yml: the Quality Gate has no unit-test step (turbo run test)");
  if (!/^\s+run: pnpm exec turbo run test:int(\s|$)/m.test(ci))
    gaps.push(
      ".github/workflows/ci.yml: the Quality Gate has no integration-test step (turbo run test:int)",
    );
  for (const { folder, manifest, reason } of members) {
    if (reason && !manifest.scripts?.["test:int"])
      gaps.push(
        `${folder}/package.json: no \`test:int\` script although ${reason}; add "test:int": "stackra test --tier int"`,
      );
  }
  return gaps;
}

/** The check's parts, one export (ADR 0305): the readers, the member rule and the gap list. */
export const TEST_TIERS = { workspaceGlobs, isMember, intTierReason, tierGaps };

/** The tracked files of the repository. */
function trackedFiles() {
  const out = spawnSync("git", ["ls-files", "-z"], { encoding: "utf8" });
  if (out.status !== 0) throw new Error(`git ls-files failed: ${out.stderr}`);
  return out.stdout.split("\0").filter(Boolean);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const files = trackedFiles();
  const globs = workspaceGlobs(readFileSync("pnpm-workspace.yaml", "utf8"));
  const members = files
    .filter((file) => posix.basename(file) === "package.json" && file !== "package.json")
    .map((file) => dirname(file))
    .filter((folder) => isMember(folder, globs))
    .map((folder) => {
      const manifest = JSON.parse(readFileSync(`${folder}/package.json`, "utf8"));
      const own = files
        .filter((file) => file.startsWith(`${folder}/`))
        .map((file) => file.slice(folder.length + 1));
      const reason = intTierReason({
        files: own,
        manifest,
        read: (file) => readFileSync(`${folder}/${file}`, "utf8"),
      });
      return { folder, manifest, reason };
    });
  const gaps = tierGaps({
    scripts: JSON.parse(readFileSync("package.json", "utf8")).scripts ?? {},
    turbo: readFileSync("turbo.jsonc", "utf8"),
    ci: readFileSync(".github/workflows/ci.yml", "utf8"),
    members,
  });
  for (const member of members.filter(({ reason }) => reason))
    console.log(`int tier: ${member.folder} (${member.reason})`);
  for (const gap of gaps) console.error(gap);
  if (gaps.length === 0) console.log("test tiers: wired");
  process.exit(gaps.length > 0 ? 1 : 0);
}
