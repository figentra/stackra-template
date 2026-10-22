#!/usr/bin/env node
/**
 * Stackra file contract:
 * Purpose: the pre-release Quality Gate, one command for CI and for agents: `node .github/scripts/preview-gate.mjs`.
 *          It runs every check that needs no workspace install (pull request title and commit messages, format,
 *          spelling, config files parse, secrets scan), because the `@stackra/*` packages and the `stackra` CLI
 *          are not published yet.
 * Boundary: reads tracked files and git history and reports findings; it never edits a file. Tools are pinned
 *           here (npx with exact versions; gitleaks from mise.toml). Delete this script and its workflow step
 *           once `pnpm install --frozen-lockfile` and `pnpm verify` run in CI.
 * Runtime: node (built-ins only, so it runs before any install)
 * Governing contract: Stackra ADR 0019 (pinned tools), ADR 0027 (toolchain from mise.toml)
 *
 * Usage: `node .github/scripts/preview-gate.mjs [commits|format|spelling|config|secrets ...]` (default: all five).
 * `commits` lints the pull request title (PR_TITLE) and BASE_SHA..HEAD_SHA (CI) or origin/main..HEAD (local); it
 * is skipped outside pull requests (push, merge_group) and on renovate/ and changeset-release/ branches
 * (PR_BRANCH), whose titles and commit messages a bot writes.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Exact versions of the tools fetched with npx. COMMITLINT, OXFMT and CSPELL equal their pnpm-workspace.yaml
 * catalog pins (`release` and `quality`); bump them together. YAML is the `yaml` parser this script alone
 * uses, so it has no catalog entry.
 */
const COMMITLINT = "21.2.3";
const OXFMT = "0.71.0";
const CSPELL = "10.4.0";
const YAML = "2.9.1";

/**
 * npm settings for every npx call. A stalled registry request otherwise waits npm's default 5-minute
 * fetch timeout before its retry (seen on GitHub runners); 30 s fails it fast and npm retries.
 */
const NPM_ENV = {
  npm_config_fetch_timeout: process.env.npm_config_fetch_timeout || "30000",
  npm_config_fetch_retries: process.env.npm_config_fetch_retries || "3",
  npm_config_update_notifier: "false",
};

/** JSON files that are JSONC (comments allowed), so a strict JSON.parse would reject them. */
const JSONC = [
  /(^|\/)tsconfig[^/]*\.json$/,
  /^\.vscode\//,
  /^packages\/tooling\/typescript\/src\/[^/]+\.json$/,
  // eas-cli refuses a root `$comment` key but reads a non-strict file as JSON5, so the contract is `//` lines
  /(^|\/)eas\.json$/,
];

/**
 * Run a command with inherited output and return true when it exits 0.
 * @param cmd - the program to run.
 * @param args - its arguments.
 * @param input - optional text piped to stdin; output is then captured and printed only on failure.
 * @param env - extra environment variables for this one command.
 */
function run(cmd, args, input, env = {}) {
  const piped = input !== undefined;
  const result = spawnSync(cmd, args, {
    input,
    stdio: piped ? "pipe" : "inherit",
    encoding: "utf8",
    // Every npx call gets the fast-fail fetch settings; git and other tools ignore them.
    env: { ...process.env, ...NPM_ENV, ...env },
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
 * Lint the pull request title and the commit messages of its range with the conventional preset. The title
 * becomes the squash-merge commit subject, so it obeys the same rules. The repo's own `.commitlintrc.yaml`
 * extends `@stackra/commitlint-config`, which needs an install, so this gate uses
 * `@commitlint/config-conventional` directly.
 */
function commits() {
  const event = process.env.GITHUB_EVENT_NAME;
  if (event && event !== "pull_request") return skip("commits", `not a pull request (${event})`);
  if (/^(renovate|changeset-release)\//.test(process.env.PR_BRANCH ?? "")) {
    return skip("commits", `bot branch ${process.env.PR_BRANCH}`);
  }
  const dir = mkdtempSync(join(tmpdir(), "preview-gate-"));
  try {
    const configFile = join(dir, "commitlint.yaml");
    writeFileSync(configFile, 'extends: ["@commitlint/config-conventional"]\n');
    const commitlint = [
      "--yes",
      "-p",
      `@commitlint/cli@${COMMITLINT}`,
      "-p",
      `@commitlint/config-conventional@${COMMITLINT}`,
      "commitlint",
      "--config",
      configFile,
    ];
    // The title is read from the environment and piped on stdin, so it never reaches a shell.
    const title = process.env.PR_TITLE;
    const titleOk = title
      ? run("npx", commitlint, title)
      : skip("pull request title", "PR_TITLE unset");
    if (!titleOk) console.error("the pull request title is not a conventional commit subject");
    const rangeOk = run("npx", [
      ...commitlint,
      "--from",
      process.env.BASE_SHA || "origin/main",
      "--to",
      process.env.HEAD_SHA || "HEAD",
    ]);
    return titleOk && rangeOk;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Check formatting with oxfmt, which reads `.oxfmtrc.jsonc` for width and ignores. */
function format() {
  return run("npx", ["--yes", `oxfmt@${OXFMT}`, "--check"]);
}

/**
 * Check spelling with cspell, which reads `cspell.config.yaml` (British English, the project words and the
 * ignored paths), over the same file types the pre-commit hook checks.
 */
function spelling() {
  return run("npx", [
    "--yes",
    `cspell@${CSPELL}`,
    "lint",
    "--no-progress",
    "--dot",
    "--gitignore",
    "**/*.{md,mdx,ts,tsx,css,yaml,yml}",
  ]);
}

/**
 * Parses every file named in the JSON array on stdin with the `yaml` package and prints each error with its
 * file. It runs inside the npx environment of `yaml`, whose `node_modules` the shell puts on NODE_PATH.
 */
const YAML_CHECK = `
const { parseAllDocuments } = require("yaml");
const { readFileSync } = require("node:fs");
let failed = 0;
for (const file of JSON.parse(readFileSync(0, "utf8"))) {
  for (const doc of parseAllDocuments(readFileSync(file, "utf8"))) {
    for (const error of doc.errors) {
      console.error(\`invalid YAML: \${file}: \${error.message}\`);
      failed += 1;
    }
  }
}
process.exit(failed > 0 ? 1 : 0);
`;

/**
 * Parse every tracked YAML file in one `yaml` process and every strict JSON file with JSON.parse; JSONC
 * files are left to the TypeScript and editor tooling that reads them.
 */
function config() {
  const yamlFiles = tracked("*.yaml", "*.yml");
  let ok = run(
    "npx",
    [
      "--yes",
      "-p",
      `yaml@${YAML}`,
      "-c",
      // npx puts the package's .bin on PATH but not its node_modules on NODE_PATH; derive it from the bin.
      'NODE_PATH="$(dirname "$(command -v yaml)")/.." node -e "$YAML_CHECK"',
    ],
    JSON.stringify(yamlFiles),
    { YAML_CHECK },
  );
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

const CHECKS = { commits, format, spelling, config, secrets };
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
  failed.length > 0 ? `\nfailed: ${failed.join(", ")}` : "\npre-release gate: all checks passed",
);
process.exit(failed.length > 0 ? 1 : 0);
