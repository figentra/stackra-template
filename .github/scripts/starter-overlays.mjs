#!/usr/bin/env node
/**
 * Stackra file contract:
 * Purpose: the minimal starter profile's derived overlays. `stackra create` (default profile `minimal`) writes an
 *          app that belongs to whoever creates it, so the root files that carry Figentra's own setup are replaced by
 *          clean copies under `starter/minimal/` (STA-2877). Six of them are derived here from their root file, so
 *          they never drift from it: package.json (no Figentra Flow), pnpm-workspace.yaml (no Figentra scopes),
 *          .mcp.yaml (the Stackra, Encore and HeroUI servers only, the Encore entry unchanged), .claude/settings.json
 *          (no Flow guard hooks, no bot identity, no Figentra permissions), lefthook.yml (no Flow spec-branch hook)
 *          and .github/workflows/ci.yml (no Figentra registry token). It also names Figentra's furniture (FURNITURE):
 *          the paths only the opt-in `internal` and `full` profiles write.
 * Boundary: reads the root files and writes `starter/minimal/<path>` (or, with `--check`, writes nothing and exits 1
 *           listing each overlay that differs from what it derives). Every transform drops a known piece when it is
 *           there, then a post-condition refuses any Figentra token left over, so a reshaped root file fails loudly
 *           instead of shipping furniture. The hand-written overlays (README.md, CONTRIBUTING.md, .npmrc, llms.txt,
 *           runway.yaml) are listed in stackra.starter.yaml, not derived. JSON is compared parsed, since oxfmt owns its
 *           layout; `--write` formats what it wrote with the workspace's oxfmt when it is installed.
 * Runtime: node (built-ins only, so its test runs in the pre-release gate before any install)
 * Governing contract: Stackra ADR 0515 (decisions 5 and 6: the starter manifest and its profiles); STA-2877.
 *
 * Usage: `node .github/scripts/starter-overlays.mjs [--check]` from the repository root.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, matchesGlob } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { pathToFileURL } from "node:url";

/** Where the minimal profile's overlay sources live (ADR 0515 decision 5). */
const OVERLAY_DIR = "starter/minimal";

/** The MCP servers a created app keeps: the framework's own, its runtime's and its console's UI kit. */
const OUTSIDE_MCP = ["stackra", "encore", "heroui-react"];

/**
 * Figentra's furniture: the paths a minimal app never gets. Only `internal` and `full` write them. `.claude/settings.json`
 * is not here: the minimal profile writes its clean overlay instead.
 */
const FURNITURE = [
  ".flow/**",
  ".opencode/**",
  "opencode.jsonc",
  "flow.config.json",
  "STATE.md",
  ".agents/hooks/**",
  ".agents/skills/flow-*/**",
  ".github/CODEOWNERS",
  ".github/actions/**",
  ".github/assets/**",
  ".github/workflows/fflow-*.yml",
  ".github/workflows/deploy.yml",
  ".github/workflows/release.yml",
  ".github/workflows/README.md",
  ".github/scripts/pack-starter.mjs",
  ".github/scripts/publish-service-contracts.sh",
  ".github/scripts/starter-overlays.mjs",
  ".github/scripts/__tests__/pack-starter.test.mjs",
  ".github/scripts/__tests__/starter-overlays.test.mjs",
];

/** Text that marks Figentra's setup; no derived overlay may hold it. */
const FIGENTRA_TOKENS = [
  "fflow",
  "@figentra-oss",
  '"@figentra/*"',
  "figentra-usr",
  "figentra/secrets",
  "registry-auth",
  "stackra-bot",
  "STACKRA_BOT",
  "id-token",
];

/** The path with each segment's leading dot dropped, as `stackra create` matches (`*` never matches a dot file). */
const undot = (path) => path.replaceAll(/(^|\/)\./g, "$1");

/**
 * Whether a path matches one of the globs, with `stackra create`'s semantics (Node `path.matchesGlob` on undotted
 * paths).
 * @param path - a POSIX path from the repository root.
 * @param globs - POSIX globs from the repository root.
 * @returns true when one glob matches.
 * @example
 * matchesAny(".flow/lock.json", [".flow/**"]); // true
 */
function matchesAny(path, globs) {
  return globs.some((glob) => matchesGlob(undot(path), undot(glob)));
}

/**
 * Reads the subset of YAML stackra.starter.yaml is written in: block mappings and sequences, plain or quoted
 * scalars, whole-line and trailing comments. Anything else (flow collections, anchors, multi-line scalars) is
 * refused, so a reshaped manifest fails here instead of being misread.
 * @param text - the manifest's text.
 * @returns the parsed value.
 * @throws Error on a construct outside the subset.
 * @example
 * readYamlSubset("a:\n  - x\n"); // { a: ["x"] }
 */
function readYamlSubset(text) {
  const lines = [];
  for (const [index, raw] of text.split("\n").entries()) {
    const content = stripComment(raw).trimEnd();
    if (content.trim() === "") continue;
    const indent = content.length - content.trimStart().length;
    lines.push({ indent, body: content.trimStart(), line: index + 1 });
  }
  let at = 0;
  const scalar = (entry, value) => {
    if (/^[[{&*!|>]/.test(value)) fail(entry, `unsupported YAML: ${value}`);
    if (value.startsWith('"')) return JSON.parse(value);
    if (value.startsWith("'")) return value.slice(1, -1).replaceAll("''", "'");
    if (/^-?\d+$/.test(value)) return Number(value);
    return value;
  };
  const pair = (entry, body) => {
    const match = /^("[^"]*"|'[^']*'|[^:]+?):(?:\s+(.*))?$/.exec(body);
    if (match === null) fail(entry, `expected "key: value", got ${body}`);
    return [scalar(entry, match[1]), match[2]];
  };
  const block = (indent) => {
    const first = lines[at];
    if (first.body.startsWith("- ") || first.body === "-") {
      const list = [];
      while (at < lines.length && lines[at].indent === indent && lines[at].body.startsWith("-")) {
        const entry = lines[at];
        const rest = entry.body.slice(1).trimStart();
        if (rest === "") fail(entry, "an empty sequence item");
        if (/^("[^"]*"|'[^']*'|[^:"']+):(\s|$)/.test(rest)) {
          // A mapping item: its first pair sits on the dash line, the rest two columns deeper.
          lines[at] = { indent: indent + 2, body: rest, line: entry.line };
          list.push(block(indent + 2));
        } else {
          list.push(scalar(entry, rest));
          at += 1;
        }
      }
      return list;
    }
    const map = {};
    while (at < lines.length && lines[at].indent === indent && !lines[at].body.startsWith("- ")) {
      const entry = lines[at];
      const [key, value] = pair(entry, entry.body);
      at += 1;
      if (value !== undefined && value !== "") map[key] = scalar(entry, value);
      else if (at < lines.length && lines[at].indent > indent) map[key] = block(lines[at].indent);
      else map[key] = null;
    }
    return map;
  };
  const value = block(0);
  if (at < lines.length) fail(lines[at], "unexpected indentation");
  return value;
}

/** Refuses a manifest line. */
function fail(entry, why) {
  throw new Error(`stackra.starter.yaml line ${entry.line}: ${why}`);
}

/** The line without a comment: a `#` at its start or after a space, outside quotes. */
function stripComment(line) {
  let quote = "";
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (quote !== "") {
      if (char === quote) quote = "";
    } else if (char === '"' || char === "'") quote = char;
    else if (char === "#" && (i === 0 || /\s/.test(line[i - 1]))) return line.slice(0, i);
  }
  return line;
}

/** A file of the starter, or of its own tooling or vault binding, that `stackra create` never copies. */
const never = (path) =>
  path === "stackra.starter.yaml" ||
  path === "pnpm-lock.yaml" ||
  path === ".infisical.yaml" ||
  path.startsWith("starter/");

/**
 * The files a profile writes, by target path: each tracked file its `include` globs match (minus the files
 * `stackra create` never copies), then each overlay target, mapped to the starter file it comes from.
 * @param manifest - the parsed stackra.starter.yaml.
 * @param profile - the profile's name.
 * @param tracked - the template's tracked paths.
 * @returns target path to source path.
 * @throws Error on an unknown profile.
 * @example
 * profileFiles(manifest, "minimal", ["README.md"]).get("README.md"); // "starter/minimal/README.md"
 */
function profileFiles(manifest, profile, tracked) {
  const spec = manifest.profiles?.[profile];
  if (spec === undefined) throw new Error(`stackra.starter.yaml has no profile ${profile}`);
  const files = new Map();
  for (const path of tracked)
    if (!never(path) && matchesAny(path, spec.include)) files.set(path, path);
  for (const [target, source] of Object.entries(spec.overlay ?? {})) files.set(target, source);
  return files;
}

/** Drops a piece of text when it is there. */
const drop = (text, piece) => text.replace(piece, "");

/**
 * Refuses any Figentra token in a derived overlay.
 * @param path - the overlay's target path, for the message.
 * @param text - the derived text.
 * @returns the text.
 * @throws Error naming the token and the root file to look at.
 */
function clean(path, text) {
  const left = FIGENTRA_TOKENS.filter((token) => text.includes(token));
  if (left.length > 0)
    throw new Error(
      `${path}: the root file changed shape and its outside copy still holds ${left.join(", ")}; teach ` +
        `.github/scripts/starter-overlays.mjs the new shape`,
    );
  return text;
}

/** package.json without Figentra Flow and the template-only layout allowances. */
function packageJson(source) {
  const value = JSON.parse(source);
  delete value.devDependencies?.["@figentra-oss/flow"];
  delete value.scripts?.["agents:setup"];
  delete value.stackra?.layout?.allow?.["stackra.starter.yaml"];
  delete value.stackra?.layout?.allow?.starter;
  return clean("package.json", `${JSON.stringify(value, null, 2)}\n`);
}

/** pnpm-workspace.yaml without the Figentra Flow pin and the Figentra scopes' release-age exemption. */
function pnpmWorkspace(source) {
  let text = source;
  text = drop(text, /^ {2}- "@figentra-oss\/\*"\n/m);
  text = drop(text, /^ {2}- "@figentra\/\*"\n/m);
  text = drop(text, /^ {4}# Figentra Flow:.*\n/m);
  text = drop(text, /^ {4}"@figentra-oss\/flow": .*\n/m);
  return clean("pnpm-workspace.yaml", text);
}

/** .mcp.yaml with the outside servers only, each entry byte for byte as the root has it. */
function mcpYaml(source) {
  const lines = source.split("\n");
  const start = lines.indexOf("mcpServers:");
  if (start < 0) throw new Error(".mcp.yaml: no mcpServers mapping");
  const entries = new Map();
  let name;
  for (const line of lines.slice(start + 1)) {
    const head = /^ {2}([A-Za-z0-9_-]+):\s*$/.exec(line);
    if (head !== null) {
      name = head[1];
      entries.set(name, [line]);
    } else if (name !== undefined && line !== "") entries.get(name).push(line);
  }
  const missing = OUTSIDE_MCP.filter((server) => !entries.has(server));
  if (missing.length > 0) throw new Error(`.mcp.yaml: no ${missing.join(", ")} server`);
  const kept = [...entries.keys()].filter((server) => OUTSIDE_MCP.includes(server));
  const text = [
    "# The MCP servers this app's coding agents use: Stackra's own CLI, the local Encore app and the HeroUI docs",
    "# the console is built with. `stackra mcp sync` (run by `prepare`) renders the gitignored .mcp.json from this",
    "# file; add a server here and run it again.",
    "mcpServers:",
    ...kept.flatMap((server) => entries.get(server)),
    "",
  ].join("\n");
  return clean(".mcp.yaml", text);
}

/** The MCP server a permission rule names (`mcp__<server>` or `mcp__<server>__<tool>`), if any. */
const server = (rule) => /^mcp__(.+?)(?:__|$)/.exec(rule)?.[1];

/** .claude/settings.json without the Flow guard hooks, the bot identity and Figentra's own permission rules. */
function claudeSettings(source) {
  const value = JSON.parse(source);
  delete value.hooks;
  delete value.enableAllProjectMcpServers;
  for (const key of [
    "GIT_AUTHOR_NAME",
    "GIT_AUTHOR_EMAIL",
    "GIT_COMMITTER_NAME",
    "GIT_COMMITTER_EMAIL",
  ])
    delete value.env?.[key];
  for (const tier of ["allow", "ask", "deny"]) {
    const rules = value.permissions?.[tier];
    if (!Array.isArray(rules)) continue;
    value.permissions[tier] = rules.filter(
      (rule) =>
        !/figentra/i.test(rule) &&
        (server(rule) === undefined || OUTSIDE_MCP.includes(server(rule))),
    );
  }
  const text = `${JSON.stringify(value, null, 2)}\n`;
  if (/figentra/i.test(text)) throw new Error(".claude/settings.json: a Figentra rule is left");
  return clean(".claude/settings.json", text);
}

/** lefthook.yml without the Flow header, the Flow guard exclusions and the Flow spec-branch hook. */
function lefthook(source) {
  let text = source;
  text = drop(text, /^# Generated by fflow.*\n/m);
  text = drop(text, /^ {6}exclude:\n {8}- "\.agents\/hooks\/fflow-guard\.mjs"\n(?! {8}- )/m);
  text = drop(text, /^ {8}- "\.agents\/hooks\/fflow-guard\.mjs"\n/m);
  text = drop(text, /^ {4}- name: spec-branch\n(?: {6,}.*\n)+/m);
  return clean("lefthook.yml", text);
}

/** The Quality Gate without Figentra's registry token: @stackra/* installs anonymously. */
function ciWorkflow(source) {
  let text = source;
  text = text.replace(
    /The one\n# {11}credential is the Stackra registry read token \(\.github\/actions\/registry-auth, SOPS through\n# {11}Workload Identity, so the gate job has id-token: write\)\. /,
    "It reads no\n#           credential: @stackra/* installs anonymously from the Stackra registry. ",
  );
  text = text.replace(
    /Nothing in the gate writes to the repository; its only OIDC use\n# is the registry read token\./,
    "Nothing in the gate writes to the repository or asks for a token.",
  );
  text = drop(text, /^ {6}id-token: write.*\n/m);
  text = drop(
    text,
    /^ {6}# The Stackra registry read token in ~\/\.npmrc.*\n {6}# \.github\/actions\/registry-auth\.\n/m,
  );
  text = drop(
    text,
    /^ {6}- name: Registry auth\n {8}uses: \.\/\.github\/actions\/registry-auth\n\n/m,
  );
  text = text.replace(
    / {6}# STA-2064: no test step; tests run on the box \(CONTRIBUTING\.md\)\. On a pull request typecheck and\n {6}# build run/,
    "      # On a pull request typecheck and build run",
  );
  return clean(".github/workflows/ci.yml", text);
}

/** Each derived overlay: its target path, the root file it comes from and its transform. */
const DERIVED = [
  { path: "package.json", derive: packageJson, json: true },
  { path: "pnpm-workspace.yaml", derive: pnpmWorkspace },
  { path: ".mcp.yaml", derive: mcpYaml },
  { path: ".claude/settings.json", derive: claudeSettings, json: true },
  { path: "lefthook.yml", derive: lefthook },
  { path: ".github/workflows/ci.yml", derive: ciWorkflow },
];

/**
 * The derived overlays of a template checkout.
 * @param read - returns a root file's text by path.
 * @returns each overlay's source path (under starter/minimal/), its text and whether it is JSON.
 * @example
 * deriveOverlays((path) => readFileSync(path, "utf8"))[0].source; // "starter/minimal/package.json"
 */
function deriveOverlays(read) {
  return DERIVED.map(({ path, derive, json = false }) => ({
    path,
    source: `${OVERLAY_DIR}/${path}`,
    text: derive(read(path)),
    json,
  }));
}

/**
 * Whether a committed overlay equals its derived text: JSON compared parsed (oxfmt owns the layout), the rest
 * byte for byte.
 * @param committed - the overlay's text on disk, or undefined when it is missing.
 * @param overlay - the derived overlay.
 * @returns true when they match.
 */
function sameOverlay(committed, overlay) {
  if (committed === undefined) return false;
  if (!overlay.json) return committed === overlay.text;
  try {
    return isDeepStrictEqual(JSON.parse(committed), JSON.parse(overlay.text));
  } catch {
    return false;
  }
}

/** What the tests reach. */
export const STARTER_OVERLAYS = {
  FIGENTRA_TOKENS,
  FURNITURE,
  OUTSIDE_MCP,
  OVERLAY_DIR,
  deriveOverlays,
  matchesAny,
  profileFiles,
  readYamlSubset,
  sameOverlay,
  transforms: { ciWorkflow, claudeSettings, lefthook, mcpYaml, packageJson, pnpmWorkspace },
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const root = process.cwd();
  const check = process.argv.includes("--check");
  const overlays = deriveOverlays((path) => readFileSync(join(root, path), "utf8"));
  const stale = [];
  const written = [];
  for (const overlay of overlays) {
    const file = join(root, overlay.source);
    const committed = existsSync(file) ? readFileSync(file, "utf8") : undefined;
    if (sameOverlay(committed, overlay)) continue;
    if (check) {
      stale.push(overlay.source);
      continue;
    }
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, overlay.text);
    written.push(overlay.source);
  }
  if (check) {
    for (const source of stale)
      console.error(
        `${source} differs from its root file; run node .github/scripts/starter-overlays.mjs`,
      );
    process.exit(stale.length > 0 ? 1 : 0);
  }
  const oxfmt = join(root, "node_modules/.bin/oxfmt");
  if (written.length > 0 && existsSync(oxfmt))
    spawnSync(oxfmt, ["--write", ...written], { cwd: root, stdio: "inherit" });
  for (const source of written) console.log(`wrote ${source}`);
}
