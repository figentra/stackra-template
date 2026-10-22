#!/usr/bin/env node
/**
 * Stackra file contract:
 * Purpose: the preview Quality Gate, one command for CI and for agents: `node .github/scripts/preview-gate.mjs`.
 *          It runs every check that needs no workspace install (commit messages, format, config files parse,
 *          secrets scan), because the `@stackra/*` packages and the `stackra` CLI are not published yet.
 * Boundary: reads tracked files and git history and reports findings; it never edits a file. Tools are pinned
 *           here (npx with exact versions; gitleaks from mise.toml). Delete this script and its workflow step
 *           once `pnpm install --frozen-lockfile` and `pnpm verify` run in CI.
 * Runtime: node (built-ins only, so it runs before any install)
 * Governing contract: Stackra ADR 0019 (pinned tools), ADR 0027 (toolchain from mise.toml)
 *
 * Usage: `node .github/scripts/preview-gate.mjs [commits|format|config|secrets ...]` (default: all four).
 * `commits` lints BASE_SHA..HEAD_SHA (CI) or origin/main..HEAD (local); it is skipped on push events and on
 * renovate/ and changeset-release/ branches (PR_BRANCH), whose commit messages a bot writes.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/** Exact versions of the tools fetched with npx; bump them together with the workspace catalogs. */
const COMMITLINT = "21.2.3";
const OXFMT = "0.71.0";
const YAML = "2.9.1";

/** JSON files that are JSONC (comments allowed), so a strict JSON.parse would reject them. */
const JSONC = [
  /(^|\/)tsconfig[^/]*\.json$/,
  /^\.vscode\//,
  /^packages\/tooling\/typescript\/src\/[^/]+\.json$/,
];

/**
 * Run a command with inherited output and return true when it exits 0.
 * @param cmd - the program to run.
 * @param args - its arguments.
 * @param input - optional text piped to stdin; output is then captured and printed only on failure.
 */
function run(cmd, args, input) {
  const piped = input !== undefined;
  const result = spawnSync(cmd, args, {
    input,
    stdio: piped ? "pipe" : "inherit",
    encoding: "utf8",
  });
  if (result.error) console.error(`${cmd}: ${result.error.message}`);
  if (piped && result.status !== 0) process.stderr.write(result.stderr || result.stdout || "");
  return result.status === 0;
}

/**
 * List tracked files matching git pathspecs.
 * @param patterns - pathspecs passed to `git ls-files`.
 */
function tracked(...patterns) {
  const out = spawnSync("git", ["ls-files", "-z", "--", ...patterns], { encoding: "utf8" });
  if (out.status !== 0) throw new Error(`git ls-files failed: ${out.stderr}`);
  return out.stdout.split("\0").filter(Boolean);
}

/**
 * Lint the commit messages of the pull request range with the conventional preset. The repo's own
 * `.commitlintrc.yaml` extends `@stackra/commitlint-config`, which needs an install, so the preview uses
 * `@commitlint/config-conventional` directly.
 */
function commits() {
  const event = process.env.GITHUB_EVENT_NAME;
  if (event && event !== "pull_request") return skip("commits", `not a pull request (${event})`);
  if (/^(renovate|changeset-release)\//.test(process.env.PR_BRANCH ?? "")) {
    return skip("commits", `bot branch ${process.env.PR_BRANCH}`);
  }
  const config = join(mkdtempSync(join(tmpdir(), "preview-gate-")), "commitlint.yaml");
  writeFileSync(config, 'extends: ["@commitlint/config-conventional"]\n');
  return run("npx", [
    "--yes",
    "-p",
    `@commitlint/cli@${COMMITLINT}`,
    "-p",
    `@commitlint/config-conventional@${COMMITLINT}`,
    "commitlint",
    "--config",
    config,
    "--from",
    process.env.BASE_SHA || "origin/main",
    "--to",
    process.env.HEAD_SHA || "HEAD",
  ]);
}

/** Check formatting with oxfmt, which reads `.oxfmtrc.jsonc` for width and ignores. */
function format() {
  return run("npx", ["--yes", `oxfmt@${OXFMT}`, "--check"]);
}

/**
 * Parse every tracked YAML file (with the `yaml` CLI, one file per stdin) and every strict JSON file
 * (with JSON.parse); JSONC files are left to the TypeScript and editor tooling that reads them.
 */
function config() {
  let ok = true;
  for (const file of tracked("*.yaml", "*.yml")) {
    if (!run("npx", ["--yes", `yaml@${YAML}`, "valid"], readFileSync(file, "utf8"))) {
      console.error(`invalid YAML: ${file}`);
      ok = false;
    }
  }
  for (const file of tracked("*.json").filter((f) => !JSONC.some((re) => re.test(f)))) {
    try {
      JSON.parse(readFileSync(file, "utf8"));
    } catch (error) {
      console.error(`invalid JSON: ${file}: ${error.message}`);
      ok = false;
    }
  }
  return ok;
}

/**
 * Scan the history reachable from HEAD for secrets with gitleaks (installed by mise), which reads
 * `.gitleaks.toml`. `--log-opts=HEAD` keeps a local run to the checked-out branch, as in CI; without it
 * gitleaks walks every local branch.
 */
function secrets() {
  return run("gitleaks", ["git", "--no-banner", "--redact", "--log-opts=HEAD", "."]);
}

/**
 * Report a check that does not apply to this run and count it as passed.
 * @param name - the check's name.
 * @param reason - why it was skipped.
 */
function skip(name, reason) {
  console.log(`skip ${name}: ${reason}`);
  return true;
}

const CHECKS = { commits, format, config, secrets };
const wanted = process.argv.slice(2);
const unknown = wanted.filter((name) => !(name in CHECKS));
if (unknown.length > 0) {
  console.error(`unknown check: ${unknown.join(", ")} (known: ${Object.keys(CHECKS).join(", ")})`);
  process.exit(2);
}
const failed = [];
for (const name of wanted.length > 0 ? wanted : Object.keys(CHECKS)) {
  console.log(`\n== ${name}`);
  if (!CHECKS[name]()) failed.push(name);
}
console.log(
  failed.length > 0 ? `\nfailed: ${failed.join(", ")}` : "\npreview gate: all checks passed",
);
process.exit(failed.length > 0 ? 1 : 0);
