#!/usr/bin/env node
/**
 * Stackra file contract:
 * Purpose: the minimal starter profile's derived overlays. `stackra create` (default profile `minimal`) writes an
 *          app that belongs to whoever creates it, so the root files that carry Figentra's own setup are replaced by
 *          clean copies under `starter/minimal/` (STA-2877). Most of them are derived here from their root file, so
 *          they never drift from it: package.json (no Figentra Flow), pnpm-workspace.yaml (no Figentra scopes),
 *          .mcp.yaml (the Stackra, Encore and HeroUI servers only, the Encore entry unchanged), .claude/settings.json
 *          (no Flow guard hooks, no bot identity, no Figentra permissions), lefthook.yml (no Flow spec-branch hook),
 *          .github/workflows/ci.yml (no Figentra registry token, and a Test step: Figentra runs its own tests on its
 *          build box, an app runs them in its gate), AGENTS.md and CLAUDE.md (the app's own head and tail around the
 *          programming model, no Figentra Flow), the framework's open rules and skills (OPEN_AGENT_FILES, without
 *          the Flow header), docs/template-guide.md and the oxfmt, oxlint and cspell configs (no Flow paths). It also
 *          names Figentra's furniture (FURNITURE): the paths only the opt-in `internal` and `full` profiles write.
 * Boundary: reads the root files and writes `starter/minimal/<path>` (or, with `--check`, writes nothing and exits 1
 *           listing each overlay that differs from what it derives). Every transform drops a known piece when it is
 *           there, then a post-condition refuses any Figentra token left over, so a reshaped root file fails loudly
 *           instead of shipping furniture. The hand-written overlays (README.md, CONTRIBUTING.md, .npmrc, llms.txt,
 *           runway.yaml) are listed in stackra.starter.yaml, not derived. JSON is compared parsed, since oxfmt owns its
 *           layout; `--write` formats the JSON it wrote with the workspace's oxfmt when it is installed.
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
  // The agent setup Figentra Flow renders for Stackra's own team: the personas and the model routing its delegation
  // reads, the Encore reference only the compiler's engineers read, and every rule and skill outside the open set
  // (OPEN_AGENT_FILES): Linear, worktrees, concurrent sessions, secrets through the bot, the spec flow, the build box.
  ".agents/agents/**",
  // The Flow spec folders this template's own changes carry (ADR 0502); an app writes its own.
  ".agents/specs/**",
  ".agents/models.yaml",
  ".agents/routing.yaml",
  ".agents/reference/**",
  ".agents/rules/ai-tools.md",
  ".agents/rules/concurrent-sessions.md",
  ".agents/rules/linear.md",
  ".agents/rules/secrets.md",
  ".agents/rules/task-vocabulary.md",
  ".agents/rules/third-party-sources.md",
  ".agents/rules/workspace-layout.md",
  ".agents/rules/worktrees.md",
  ".agents/skills/docs-adr/**",
  ".agents/skills/docs-spec-flow/**",
  ".agents/skills/mobile-eas-setup/**",
  ".agents/skills/mobile-release/**",
  ".agents/skills/mobile-store-listing/**",
  ".agents/skills/test-infra/**",
];

/**
 * The framework's open agent conventions a minimal app keeps: the rules and skills `@stackra/skills` publishes for every
 * Stackra app, each derived without its Figentra Flow header. Every other `.agents/` path is in FURNITURE.
 */
const OPEN_AGENT_FILES = [
  ...[
    "http-conventions",
    "module-boundary",
    "naming-and-casing",
    "not-built-yet",
    "service-checklist",
    "tenancy",
    "versions",
  ].map((rule) => `.agents/rules/${rule}.md`),
  ...[
    "ai-mcp-tools",
    "backend-assets-and-storage",
    "backend-author-an-action",
    "backend-decorator-package-with-explorer",
    "backend-errors",
    "backend-gen-and-encore-target",
    "backend-module-and-root-module",
    "code-naming-and-casing",
    "db-models-and-migrations",
    "frontend-resource-console",
  ].map((skill) => `.agents/skills/${skill}/SKILL.md`),
];

/**
 * Text that marks Figentra's setup or its own process; no derived overlay may hold it. Figentra Flow and the files it
 * renders, the Figentra registry and code owners, the bot and its scripts, Linear, delegation and Figentra's build box.
 */
const FIGENTRA_TOKENS = [
  "fflow",
  "Figentra Flow",
  ".flow/",
  "flow.config.json",
  "@figentra-oss",
  '"@figentra/*"',
  "figentra-usr",
  "figentra/secrets",
  "figentra/sta-",
  "registry-auth",
  "stackra-bot",
  "STACKRA_BOT",
  "id-token",
  /\bbot(?::gh|:git|:token|-token)/,
  "pnpm linear",
  "linear.app",
  "linear-release",
  /figentra (agents|linear|delegate|bot)\b/,
  ".agents/agents/",
  ".agents/hooks/",
  ".agents/reference/",
  "ci-box",
  "on the box",
  "box run",
  "STA-2064",
];

/** The path with each segment's leading dot dropped, as `stackra create` matches (`*` never matches a dot file). */
const stripDots = (path) => path.replaceAll(/(^|\/)\./g, "$1");

/**
 * Whether a path matches one of the globs, with `stackra create`'s semantics (Node `path.matchesGlob` on dot-stripped
 * paths).
 * @param path - a POSIX path from the repository root.
 * @param globs - POSIX globs from the repository root.
 * @returns true when one glob matches.
 * @example
 * matchesAny(".flow/lock.json", [".flow/**"]); // true
 */
function matchesAny(path, globs) {
  return globs.some((glob) => matchesGlob(stripDots(path), stripDots(glob)));
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
  const left = FIGENTRA_TOKENS.filter((token) =>
    typeof token === "string" ? text.includes(token) : token.test(text),
  ).map(String);
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
  text = text.replace(
    "; it warns, and installs run on the box and in CI.",
    "; it warns, and you run `pnpm install` yourself.",
  );
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

/**
 * .claude/settings.json without the Flow guard hooks, the bot identity and Figentra's own permission rules (its bot
 * scripts, Linear, Flow).
 */
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
        !/figentra|\bbot[:-]|pnpm linear|linear\.app|fflow|\.flow\//i.test(rule) &&
        (server(rule) === undefined || OUTSIDE_MCP.includes(server(rule))),
    );
  }
  const text = `${JSON.stringify(value, null, 2)}\n`;
  if (/figentra/i.test(text)) throw new Error(".claude/settings.json: a Figentra rule is left");
  return clean(".claude/settings.json", text);
}

/**
 * lefthook.yml without the Flow header, the Flow guard exclusions, the Flow spec-branch hook and Figentra's build box.
 */
function lefthook(source) {
  let text = source;
  text = drop(text, /^# Generated by fflow.*\n/m);
  text = drop(text, /^ {6}exclude:\n {8}- "\.agents\/hooks\/fflow-guard\.mjs"\n(?! {8}- )/m);
  text = drop(text, /^ {8}- "\.agents\/hooks\/fflow-guard\.mjs"\n/m);
  text = drop(text, /^ {4}- name: spec-branch\n(?: {6,}.*\n)+/m);
  // The Encore reference is Figentra's compiler material, not in an app.
  text = drop(text, /^ {8}- "\.agents\/reference\/\*\*"\n/m);
  // Figentra cites a run on its build box when a Mac cannot read the registry; an app's pull request runs the gate.
  text = text.replace(
    "; the PR must cite a box run for this commit",
    "; the Quality Gate runs gen --check on the pull request",
  );
  return clean("lefthook.yml", text);
}

/**
 * The Quality Gate's Test step for an app. Figentra's own gate leaves tests out because Figentra runs them on its build
 * box (STA-2064); an app has no such box, so its gate runs each member's suite: the affected members on a pull request,
 * every member on main and in the merge queue.
 */
const TEST_STEP = [
  "      # Each member's vitest suite (`turbo run test`, after gen), for the members the change affects on a pull",
  "      # request and for every member on main and in the merge queue.",
  "      - name: Test",
  "        if: steps.registry.outputs.published == 'true'",
  "        env:",
  "          AFFECTED: ${{ github.event_name == 'pull_request' && '1' || '' }}",
  "          TURBO_SCM_BASE: HEAD~1 # a PR checks out its merge into main, so HEAD~1 is main and the diff is the PR's own",
  "        run: pnpm exec turbo run test ${AFFECTED:+--affected}",
  "",
].join("\n");

/** The Quality Gate without Figentra's registry token (@stackra/* installs anonymously) and with a Test step. */
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
    "      # On a pull request typecheck, build and test run",
  );
  const build = /^ {6}- name: Build\n(?: {8}.*\n)+/m;
  if (!build.test(text))
    throw new Error(".github/workflows/ci.yml: no Build step to put the Test step after");
  text = text.replace(build, (step) => `${step}\n${TEST_STEP}`);
  return clean(".github/workflows/ci.yml", text);
}

/** The header Figentra Flow writes at the top of a file it renders (an HTML comment, or a YAML comment). */
const FLOW_HEADER = /^(?:<!-- |# )Generated by fflow .*\n/m;

/** An open rule or skill without the Flow header, Figentra's branch-name convention and its compiler reference. */
function agentFile(source) {
  let text = drop(source, FLOW_HEADER);
  text = drop(text, / \*\*Branches\*\*: `figentra\/sta-<n>-<slug>`\./);
  text = drop(text, /^\| Branches +\|.*\n/m);
  // The fenced Encore reference is Figentra's compiler material (FURNITURE), not in an app.
  text = text.replace(
    "Read the fenced reference in `.agents/reference/encore/` (ADR 0258)",
    "The fenced Encore reference ships with the framework's compiler, not with an app (ADR 0258)",
  );
  return text;
}

/** CLAUDE.md without the Flow header: it only points at AGENTS.md. */
function claudeMd(source) {
  return drop(source, FLOW_HEADER);
}

/** The head of the app's AGENTS.md: what the app is, written for it. */
const AGENTS_HEAD = `<!--
Stackra file contract:
Purpose: the agent entry of an app made by \`stackra create\`: what the app holds, the programming model v3.1 (grammar,
         kinds, identities and rules) and how work is done here.
Boundary: rules and orientation; the full tree is docs/template-guide.md and the framework is the Stackra docs.
Runtime: none (documentation)
Governing contract: Stackra ADR 0294 (as amended by programming model v3.1); Stackra ADR 0515 (the starter's minimal
                    profile); STA-2877
-->

# acme-platform

A [Stackra](https://docs.stackra.figentra.com) app: the web console (\`apps/console\`) and one service
(\`services/example\`, with its \`notes\` module), on the \`@stackra/*\` versions \`pnpm-workspace.yaml\`
pins. It is yours: rename, replace or delete anything here. The tree, which file owns which fact and
what to replace are in [docs/template-guide.md](docs/template-guide.md).

The programming model is **v3.1**: [Stackra ADR 0305](https://docs.stackra.figentra.com/adr/0305-programming-model-v3-1-names-partners-files-and-class-components)
amends [ADR 0294](https://docs.stackra.figentra.com/adr/0294-programming-model-v3-grammar-folders-identities-and-naming).
This file states its rules for this app, and it wins over any older form you find in a skill or a
framework page. In one line: **the path says the kind, the base class is the kind, the type gives
the shape, and the names give identity; gen derives and locks the rest in \`stackra.manifest.json\`.**
The code below is illustrative: the paths it names (\`orders\`, \`commerce\`, an app's \`src/\`) show
where a file goes, not files in this app.
`;

/** The tail of the app's AGENTS.md: its commands, its agent setup and how work is done, with no Figentra process. */
const AGENTS_TAIL = `## Commands

Every repository operation is a \`stackra\` command behind a root script: \`pnpm gen\` (after any
declaration change; commit the member's \`stackra.manifest.json\` and \`openapi.json\`),
\`pnpm new <kind> <name>\` (\`stackra new\`, which names the member after the product key),
\`pnpm verify\` (format, lint, typecheck, test, build, gen check and validate: what the Quality Gate
checks), \`pnpm validate\` (with the example drift check), \`pnpm structure\` (the group → kind → test
table), \`pnpm db:diff\` and \`pnpm run doctor\` (\`run\`, because \`pnpm doctor\` is pnpm's own command).

## Agent setup

- Framework know-how comes from the Stackra MCP server in \`.mcp.yaml\` (\`pnpm install\` renders
  \`.mcp.json\` from it).
- \`.agents/rules/\` holds the framework's rules and \`.agents/skills/\` its skills, as Stackra
  publishes them for every app. Read the rules that apply before editing, and a skill's \`SKILL.md\`
  when its trigger fits. Add your own rules and skills beside them.

## How work is done

- Branch from \`main\`, one change per branch, and open a pull request; the Quality Gate
  (\`.github/workflows/ci.yml\`) must pass before it merges.
- Commits are Conventional Commits (\`.commitlintrc.yaml\`). Never \`--no-verify\`, never \`LEFTHOOK=0\`.
- Secrets are named, never written: no value in a file, a commit, a log or a message.
- Before editing, read the README and any AGENTS.md of the member you change, then its contract,
  implementation and tests.
`;

/**
 * The app's AGENTS.md: its own head and tail around the root's programming-model sections (from Grammar to the
 * rules), without the template's description, Figentra's deploy decision or the Figentra Flow sections.
 */
function agentsMd(source) {
  const start = source.indexOf("\n## Grammar\n");
  const end = source.indexOf("\n## Commands\n");
  if (start < 0 || end < start) throw new Error("AGENTS.md: no ## Grammar … ## Commands sections");
  let body = source.slice(start + 1, end + 1);
  body = drop(body, /^- Deploys \(owner decision .*\n(?: {2}.*\n)*/m);
  body = body.replace(
    "(figentra/secrets, SOPS, synced by runway; Stackra ADR 0525)",
    "(SOPS, synced by runway; Stackra ADR 0525)",
  );
  body = body.replace('README.md ("Test header and helpers")', "the `@stackra/testing` README");
  return `${AGENTS_HEAD}\n${body}${AGENTS_TAIL}`;
}

/** Escapes a string for a regular expression. */
const literal = (text) => text.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** A Markdown table's row with `from` replaced by `to` in its cell, the cell padded to its old width. */
function inCell(text, from, to) {
  return text.replace(new RegExp(`^\\|.*${literal(from)}.*\\|$`, "m"), (row) =>
    row
      .split("|")
      .map((cell) =>
        cell.includes(from) ? ` ${cell.trim().replace(from, to)}`.padEnd(cell.length) : cell,
      )
      .join("|"),
  );
}

/**
 * The template guide without Figentra Flow (the README is the app's own, there is no flow.config.json) and without
 * Figentra's secrets repository.
 */
function templateGuide(source) {
  let text = source;
  text = text.replace(
    /^(├── README\.md +)the front page, rendered by fflow from \.flow\/readme\.yml$/m,
    "$1the front page",
  );
  text = drop(text, /^├── flow\.config\.json .*\n/m);
  text = inCell(text, "`.flow/readme.yml` (`repo`, then `fflow readme`)", "`README.md`");
  text = inCell(text, "the README banner (`banner` in `.flow/readme.yml`)", "the README banner");
  // Figentra keeps its secret values in its own figentra/secrets repository; an app keeps them in its own.
  text = text.replaceAll("figentra/secrets", "your secrets repository");
  return text;
}

/** A list entry (`"x",` in JSONC, `- x` in YAML) that names Flow or an agent path a minimal app does not have. */
const flowEntry = (line) =>
  /^\s*(?:- )?"?(?:[^"\s]*fflow[^"\s]*|\.agents\/(?:agents|hooks|reference)\/\*\*|\.agents\/(?:models|routing)\.yaml|\.?opencode[^"\s]*|README\.md)"?,?$/.test(
    line,
  );

/** Drops each list entry `flowEntry` names. */
const dropFlowEntries = (text) =>
  text
    .split("\n")
    .filter((line) => !flowEntry(line))
    .join("\n");

/** .oxfmtrc.jsonc without the Flow paths; the copied agent guidance stays unformatted, as published. */
function oxfmtrc(source) {
  let text = source;
  text = text.replace(
    /^( +)\/\/ rendered by `fflow sync`;.*\n/m,
    "$1// the agent guidance copied from the Stackra preset as published (AGENTS.md, CLAUDE.md, .agents/)\n",
  );
  text = drop(text, /^ +\/\/ also rendered by `fflow sync`.*\n/m);
  return dropFlowEntries(text);
}

/** .oxlintrc.jsonc without the Flow paths. */
function oxlintrc(source) {
  const text = source.replace(
    /^( +)\/\/ rendered by `fflow sync`.*\n/m,
    "$1// the agent skills copied from the Stackra preset as published\n",
  );
  return dropFlowEntries(text);
}

/** cspell.config.yaml without the Flow paths and the `fflow` word. */
function cspell(source) {
  const text = source.replace(
    /^( *)# Rendered by `fflow sync`.*\n/m,
    "$1# The agent guidance copied from the Stackra preset as published.\n",
  );
  return dropFlowEntries(text);
}

/** Each derived overlay: its target path, the root file it comes from and its transform. */
const DERIVED = [
  { path: "package.json", derive: packageJson, json: true },
  { path: "pnpm-workspace.yaml", derive: pnpmWorkspace },
  { path: ".mcp.yaml", derive: mcpYaml },
  { path: ".claude/settings.json", derive: claudeSettings, json: true },
  { path: "lefthook.yml", derive: lefthook },
  { path: ".github/workflows/ci.yml", derive: ciWorkflow },
  { path: "AGENTS.md", derive: agentsMd },
  { path: "CLAUDE.md", derive: claudeMd },
  ...OPEN_AGENT_FILES.map((path) => ({ path, derive: agentFile })),
  { path: "docs/template-guide.md", derive: templateGuide },
  { path: ".oxfmtrc.jsonc", derive: oxfmtrc },
  { path: ".oxlintrc.jsonc", derive: oxlintrc },
  { path: "cspell.config.yaml", derive: cspell },
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
    text: clean(path, derive(read(path))),
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
  OPEN_AGENT_FILES,
  OUTSIDE_MCP,
  OVERLAY_DIR,
  deriveOverlays,
  matchesAny,
  profileFiles,
  readYamlSubset,
  sameOverlay,
  transforms: {
    agentFile,
    agentsMd,
    ciWorkflow,
    claudeSettings,
    lefthook,
    mcpYaml,
    oxfmtrc,
    packageJson,
    pnpmWorkspace,
    templateGuide,
  },
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
    written.push(overlay);
  }
  if (check) {
    for (const source of stale)
      console.error(
        `${source} differs from its root file; run node .github/scripts/starter-overlays.mjs`,
      );
    process.exit(stale.length > 0 ? 1 : 0);
  }
  // Only JSON is compared parsed, so only JSON may be reformatted; the rest is compared byte for byte.
  const json = written.filter((overlay) => overlay.json).map((overlay) => overlay.source);
  const oxfmt = join(root, "node_modules/.bin/oxfmt");
  if (json.length > 0 && existsSync(oxfmt))
    spawnSync(oxfmt, ["--write", ...json], { cwd: root, stdio: "inherit" });
  for (const overlay of written) console.log(`wrote ${overlay.source}`);
}
