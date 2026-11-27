#!/usr/bin/env node
/**
 * Stackra file contract:
 * Purpose: keeps catalog `stackra` in pnpm-workspace.yaml (the `@stackra/cli` pin with it) in step with the Stackra
 *          registry: each entry moves to its own package's `latest` dist-tag. The catalog-latest workflow runs it,
 *          refreshes the lockfile and opens the bot pull request; the Quality Gate on that pull request judges it.
 * Boundary: reads the registry with `npm view` and, with `--write`, rewrites only the version of the catalog `stackra`
 *           lines that move. It never goes backwards (a pin ahead of `latest` is held), never moves to a deprecated
 *           version and fails, naming the packages, when a package cannot be read. Writes the GitHub step outputs
 *           `changed`, `branch` and `title` to $GITHUB_OUTPUT (stdout when unset); `--summary <file>` writes the pull
 *           request body, `--message <file>` the commit message. No token: npm reads the user-level ~/.npmrc that registry-auth wrote.
 * Runtime: node (built-ins only, so it runs before any install; `npm` on PATH)
 * Governing contract: Stackra ADR 0013 (versions only from catalogs, exact pins), ADR 0019 (supply chain: nothing
 *                     merges on its own), ADR 0453 (the registry), ADR 0515 decision 3 (the starter is packed at the
 *                     catalog's `@stackra/cli` version). Issue: STA-2884.
 *
 * Usage: `node .github/scripts/stackra-catalog.mjs [--write] [--summary <file>] [--message <file>]` from the
 * repository root.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

/** The registry the `@stackra` scope maps to in `.npmrc` (ADR 0453). */
const REGISTRY = "https://npm.stackra.figentra.com/";

/** The prefix of every branch this script names; the workflow closes older open pull requests from it. */
const BRANCH_PREFIX = "stackra/catalog-latest-";

const EXACT = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;

/**
 * The entries of catalog `stackra`: the block under `catalogs:` → `  stackra:`, one `    "@stackra/<name>": <version>`
 * line each, up to the next line indented less than four spaces.
 * @param workspaceYaml - the text of pnpm-workspace.yaml.
 * @returns each entry's package name, pinned version and line index.
 * @throws TypeError when the block is missing or empty, a line in it is not an exact `@stackra/*` pin, or a package is
 *         listed twice.
 */
function stackraCatalog(workspaceYaml) {
  const lines = workspaceYaml.split("\n");
  const catalogs = lines.findIndex((line) => /^catalogs:\s*$/.test(line));
  const start =
    catalogs < 0
      ? -1
      : lines.findIndex((line, i) => i > catalogs && /^ {2}stackra:\s*$/.test(line));
  if (start < 0) throw new TypeError("pnpm-workspace.yaml has no catalogs.stackra block");
  const entries = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^\s*(#.*)?$/.test(line)) continue;
    if (!/^ {4}/.test(line)) break;
    const pin = /^ {4}"(@stackra\/[a-z0-9-]+)": *(\S+)\s*$/.exec(line);
    if (!pin || !EXACT.test(pin[2])) {
      throw new TypeError(
        `catalogs.stackra line ${i + 1} is not an exact @stackra/* pin: ${line.trim()}`,
      );
    }
    if (entries.some((entry) => entry.name === pin[1])) {
      throw new TypeError(`catalogs.stackra lists ${pin[1]} twice`);
    }
    entries.push({ name: pin[1], version: pin[2], line: i });
  }
  if (entries.length === 0) throw new TypeError("catalogs.stackra is empty");
  return entries;
}

/**
 * Compares two exact versions by semver precedence (a pre-release sorts before its release).
 * @param a - one version.
 * @param b - the other.
 * @returns a negative number when a < b, 0 when equal, a positive number when a > b.
 */
function compareVersions(a, b) {
  const [x, y] = [EXACT.exec(a), EXACT.exec(b)];
  if (!x || !y) throw new TypeError(`not an exact version: ${x ? b : a}`);
  for (let i = 1; i <= 3; i += 1) {
    const diff = Number(x[i]) - Number(y[i]);
    if (diff !== 0) return diff;
  }
  if (x[4] === y[4]) return 0;
  if (x[4] === undefined) return 1;
  if (y[4] === undefined) return -1;
  const [p, q] = [x[4].split("."), y[4].split(".")];
  for (let i = 0; i < Math.max(p.length, q.length); i += 1) {
    if (p[i] === undefined) return -1;
    if (q[i] === undefined) return 1;
    const [m, n] = [/^\d+$/.test(p[i]), /^\d+$/.test(q[i])];
    if (m && n && Number(p[i]) !== Number(q[i])) return Number(p[i]) - Number(q[i]);
    if (m !== n) return m ? -1 : 1;
    if (p[i] !== q[i]) return p[i] < q[i] ? -1 : 1;
  }
  return 0;
}

/**
 * Reads one `npm view <name>@latest --json` run.
 * @param run - the spawn result: `status`, `stdout` and, when npm could not start, `error`.
 * @param name - the package name.
 * @returns `{ version, deprecated }` of the package's `latest`, or `{ error }` with the reason (npm missing, a network or
 *          auth failure, a package the registry does not have, an answer without a `latest` version).
 */
function latestOf(run, name) {
  if (run.error) return { error: `npm could not run: ${run.error.message}` };
  let answer;
  try {
    answer = JSON.parse(run.stdout?.trim() || "null");
  } catch {
    return { error: `npm answered something other than JSON (exit ${run.status})` };
  }
  if (run.status !== 0) {
    return {
      error: `${answer?.error?.code ?? `npm exit ${run.status}`}: ${answer?.error?.summary ?? "no detail"}`,
    };
  }
  const version = answer?.["dist-tags"]?.latest;
  if (
    answer?.name !== name ||
    typeof version !== "string" ||
    !EXACT.test(version) ||
    answer.version !== version
  ) {
    return { error: "the registry answered no exact `latest` version" };
  }
  return {
    version,
    deprecated: typeof answer.deprecated === "string" ? answer.deprecated : undefined,
  };
}

/**
 * What moves, given each entry's `latest`.
 * @param entries - catalog `stackra`, from {@link stackraCatalog}.
 * @param latest - each package's {@link latestOf} answer, by name.
 * @returns `moves` (entries behind `latest`), `held` (pins ahead of `latest`, kept) and `errors` (unreadable packages
 *          and deprecated `latest` versions; any error means nothing is written).
 */
function plan(entries, latest) {
  const moves = [];
  const held = [];
  const errors = [];
  for (const { name, version } of entries) {
    const answer = latest.get(name) ?? { error: "not read" };
    if (answer.error) errors.push(`${name}: ${answer.error}`);
    else if (answer.deprecated)
      errors.push(`${name}@${answer.version} (latest) is deprecated: ${answer.deprecated}`);
    else if (compareVersions(answer.version, version) > 0)
      moves.push({ name, from: version, to: answer.version });
    else if (compareVersions(answer.version, version) < 0)
      held.push({ name, pinned: version, latest: answer.version });
  }
  return { moves, held, errors };
}

/**
 * Rewrites the moving entries' versions; every other byte of the file is kept.
 * @param workspaceYaml - the text of pnpm-workspace.yaml.
 * @param moves - the moves from {@link plan}.
 * @returns the new text.
 */
function applyMoves(workspaceYaml, moves) {
  const lines = workspaceYaml.split("\n");
  const byName = new Map(stackraCatalog(workspaceYaml).map((entry) => [entry.name, entry]));
  for (const move of moves) {
    const entry = byName.get(move.name);
    if (!entry || entry.version !== move.from) {
      throw new TypeError(`${move.name} is not pinned at ${move.from} in catalogs.stackra`);
    }
    lines[entry.line] = lines[entry.line].replace(/(": *)\S+(\s*)$/, `$1${move.to}$2`);
  }
  return lines.join("\n");
}

/**
 * The branch, pull request title and commit message for a set of moves. The branch is named by the target versions,
 * so the same targets never open a second pull request and new targets open a new one.
 * @param moves - the moves from {@link plan}; at least one.
 * @returns `branch`, `title` (a conventional commit subject of at most 100 characters) and `message`.
 */
function proposal(moves) {
  const targets = moves.map(({ name, to }) => `${name}@${to}`).toSorted();
  const digest = createHash("sha256").update(targets.join("\n")).digest("hex").slice(0, 12);
  const cli = moves.find(({ name }) => name === "@stackra/cli");
  const scope = cli
    ? `@stackra/cli ${cli.to}`
    : `${moves.length} package${moves.length === 1 ? "" : "s"}`;
  const title = `chore(deps): move the @stackra catalog to latest (${scope})`;
  const message = [
    title,
    "",
    `Moves ${moves.length} catalog stackra entr${moves.length === 1 ? "y" : "ies"} to their latest dist-tag on the`,
    "Stackra registry and refreshes pnpm-lock.yaml. Opened by the catalog-latest workflow",
    "(.github/workflows/catalog-latest.yml); the Quality Gate on the pull request judges it.",
    "",
  ].join("\n");
  return { branch: `${BRANCH_PREFIX}${digest}`, title, message };
}

/**
 * The pull request body.
 * @param result - the plan from {@link plan}.
 * @returns Markdown.
 */
function summary({ moves, held }) {
  const rows = moves.map(({ name, from, to }) => `| \`${name}\` | ${from} | ${to} |`);
  const body = [
    "Moves catalog `stackra` in `pnpm-workspace.yaml` to each package's `latest` dist-tag on the Stackra registry,",
    "and refreshes `pnpm-lock.yaml`. A created app takes these versions, and the next release packs the",
    "`@stackra/starter` of the new `@stackra/cli` version (ADR 0515 decision 3).",
    "",
    "| Package | From | To |",
    "| --- | --- | --- |",
    ...rows,
    "",
  ];
  if (held.length > 0) {
    body.push(
      "Held (pinned ahead of `latest`, never moved backwards):",
      "",
      ...held.map(({ name, pinned, latest }) => `- \`${name}\` ${pinned} (latest ${latest})`),
      "",
    );
  }
  body.push(
    "Nothing merges on its own: a code owner reviews this against the Quality Gate. When the new versions need",
    "code changes, push them to this branch. A newer `latest` opens a new pull request and closes this one.",
    "",
    "Opened by `.github/workflows/catalog-latest.yml` (STA-2884).",
    "",
  );
  return body.join("\n");
}

/**
 * Reads every catalog package's `latest` from the registry.
 * @param entries - catalog `stackra`.
 * @returns the answers by name.
 */
function readLatest(entries) {
  const latest = new Map();
  for (const { name } of entries) {
    const run = spawnSync("npm", ["view", `${name}@latest`, "--json", "--registry", REGISTRY], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      env: {
        ...process.env,
        npm_config_fetch_timeout: process.env.npm_config_fetch_timeout || "30000",
        npm_config_fetch_retries: process.env.npm_config_fetch_retries || "3",
        npm_config_update_notifier: "false",
      },
    });
    latest.set(name, latestOf(run, name));
  }
  return latest;
}

/**
 * Writes one GitHub step output, to $GITHUB_OUTPUT or, when that is unset, to stdout.
 * @param key - the output name.
 * @param value - its value.
 */
function output(key, value) {
  const line = `${key}=${value}\n`;
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, line);
  else process.stdout.write(line);
}

/** What the tests reach: the parser, the comparison, the registry reader, the plan and its outputs. */
export const STACKRA_CATALOG = {
  BRANCH_PREFIX,
  REGISTRY,
  stackraCatalog,
  compareVersions,
  latestOf,
  plan,
  applyMoves,
  proposal,
  summary,
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const args = process.argv.slice(2);
  const option = (flag) => {
    const at = args.indexOf(flag);
    return at >= 0 ? args[at + 1] : undefined;
  };
  const file = join(process.cwd(), "pnpm-workspace.yaml");
  const text = readFileSync(file, "utf8");
  const entries = stackraCatalog(text);
  const result = plan(entries, readLatest(entries));
  for (const { name, pinned, latest } of result.held) {
    console.log(
      `::notice title=Catalog::${name} is pinned at ${pinned}, ahead of latest ${latest}; held`,
    );
  }
  if (result.errors.length > 0) {
    for (const error of result.errors) console.log(`::error title=Catalog::${error}`);
    console.error(`${result.errors.length} catalog package(s) could not be moved; nothing written`);
    process.exit(1);
  }
  if (result.moves.length === 0) {
    output("changed", "false");
    console.error(`catalog stackra: all ${entries.length} entries are at latest`);
    process.exit(0);
  }
  for (const { name, from, to } of result.moves) console.error(`${name}: ${from} -> ${to}`);
  const { branch, title, message } = proposal(result.moves);
  if (args.includes("--write")) writeFileSync(file, applyMoves(text, result.moves));
  if (option("--summary")) writeFileSync(option("--summary"), summary(result));
  if (option("--message")) writeFileSync(option("--message"), message);
  output("changed", "true");
  output("branch", branch);
  output("title", title);
}
