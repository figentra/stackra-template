/**
 * Stackra file contract:
 * Purpose: tests of the starter profiles and .github/scripts/starter-overlays.mjs (STA-2877): the default `minimal`
 *          profile writes none of Figentra's furniture and its derived overlays match their root files, the opt-in
 *          `internal` profile keeps that setup, every root and tooling path is a deliberate choice, and each transform
 *          removes what it names even from a reshaped file or refuses it.
 * Boundary: reads this checkout (git ls-files, stackra.starter.yaml, the root files and starter/minimal/); writes
 *           nothing. `stackra create` itself is covered by the CLI's own tests; the glob semantics here are the ones
 *           its `starterFiles` applies (Node `path.matchesGlob` on undotted paths).
 * Runtime: node (`node --test ".github/scripts/__tests__/*.test.mjs"`, the `scripts` check of preview-gate.mjs)
 * Governing contract: Stackra ADR 0515 (decisions 5 and 6); STA-2877
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

import { STARTER_OVERLAYS } from "../starter-overlays.mjs";

const {
  FURNITURE,
  OUTSIDE_MCP,
  deriveOverlays,
  matchesAny,
  profileFiles,
  readYamlSubset,
  sameOverlay,
  transforms,
} = STARTER_OVERLAYS;

/** The checkout's tracked files (the files `stackra create` reads from a template checkout or tarball). */
const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter((path) => path !== "" && existsSync(path));
const manifest = readYamlSubset(readFileSync("stackra.starter.yaml", "utf8"));
const read = (path) => readFileSync(path, "utf8");
const minimal = profileFiles(manifest, "minimal", tracked);
const internal = profileFiles(manifest, "internal", tracked);

/** The paths where a repository keeps its tooling: the root files and the dot folders. */
const toolingPaths = tracked.filter((path) => !path.includes("/") || path.startsWith("."));

/** Root files no profile writes for an app, or that only exist for this template. */
const TEMPLATE_ONLY = new Set(["stackra.starter.yaml", "pnpm-lock.yaml", ".infisical.yaml"]);

/** A minimal app's file, as the profile writes it. */
const text = (path) => read(minimal.get(path));

/** The server names of an .mcp.yaml. */
const servers = (yaml) =>
  [...yaml.matchAll(/^ {2}([A-Za-z0-9_-]+):\s*$/gm)].map((match) => match[1]);

/** The Encore server's entry of an .mcp.yaml. */
const encore = (yaml) => /^ {2}encore:\n(?: {4}.*\n)+/m.exec(yaml)?.[0];

test("the default profile is minimal and every profile is a filter with existing overlay sources", () => {
  assert.equal(manifest.version, 1);
  assert.deepEqual(Object.keys(manifest.profiles).toSorted(), ["full", "internal", "minimal"]);
  for (const [name, profile] of Object.entries(manifest.profiles)) {
    assert.ok(Array.isArray(profile.include) && profile.include.length > 0, `${name} has includes`);
    for (const [target, source] of Object.entries(profile.overlay ?? {})) {
      assert.ok(
        source.startsWith("starter/minimal/"),
        `${name} overlay ${target} lives under starter/minimal/`,
      );
      assert.ok(tracked.includes(source), `${name} overlay ${target}: ${source} is tracked`);
    }
  }
});

test("the minimal profile writes none of Figentra's furniture", () => {
  const furniture = [...minimal.keys()].filter((path) => matchesAny(path, FURNITURE));
  assert.deepEqual(furniture, []);
  for (const path of [
    ".flow/lock.json",
    ".github/CODEOWNERS",
    ".github/workflows/fflow-approve.yml",
    ".github/workflows/deploy.yml",
    ".github/actions/registry-auth/action.yml",
    ".agents/hooks/fflow-guard.mjs",
    "flow.config.json",
    "opencode.jsonc",
  ])
    assert.ok(!minimal.has(path), `minimal never writes ${path}`);
});

test("the minimal profile replaces each root file that carries Figentra's setup with its outside copy", () => {
  for (const path of [
    "package.json",
    "pnpm-workspace.yaml",
    ".npmrc",
    ".mcp.yaml",
    ".claude/settings.json",
    "lefthook.yml",
    ".github/workflows/ci.yml",
    "README.md",
    "CONTRIBUTING.md",
    "llms.txt",
  ])
    assert.equal(
      minimal.get(path),
      `starter/minimal/${path}`,
      `${path} comes from starter/minimal/`,
    );
});

test("the app the minimal profile writes holds no Figentra registry scope, Flow, code owner or bot", () => {
  const pkg = JSON.parse(text("package.json"));
  assert.equal(pkg.devDependencies["@figentra-oss/flow"], undefined);
  assert.ok(!JSON.stringify(pkg).includes("fflow"));
  assert.doesNotMatch(text(".npmrc"), /@figentra/);
  assert.match(text(".npmrc"), /^@stackra:registry=/m);
  assert.doesNotMatch(text("pnpm-workspace.yaml"), /@figentra-oss|"@figentra\/\*"/);
  assert.doesNotMatch(text(".github/workflows/ci.yml"), /registry-auth|id-token|figentra\/secrets/);
  assert.doesNotMatch(text("lefthook.yml"), /fflow|@figentra-oss/);
  const settings = JSON.parse(text(".claude/settings.json"));
  assert.equal(settings.hooks, undefined);
  assert.equal(settings.env.GIT_AUTHOR_NAME, undefined);
  assert.doesNotMatch(text(".claude/settings.json"), /figentra|stackra-bot|fflow/i);
  for (const path of ["README.md", "CONTRIBUTING.md", "llms.txt"])
    assert.doesNotMatch(
      text(path),
      /fflow|Figentra Flow|CODEOWNERS|figentra-usr|ci-box|--admin/,
      path,
    );
  for (const path of minimal.values())
    assert.doesNotMatch(read(path), /figentra-usr/, `${path} names no Figentra code owner`);
});

test("the minimal app's MCP servers are the outside set, the Encore entry exactly as the root has it", () => {
  const outside = read(minimal.get(".mcp.yaml"));
  assert.deepEqual(servers(outside).toSorted(), [...OUTSIDE_MCP].toSorted());
  assert.ok(encore(read(".mcp.yaml")) !== undefined);
  assert.equal(encore(outside), encore(read(".mcp.yaml")));
  assert.ok(!servers(outside).includes("stackra-cloud"));
});

test("the derived overlays match their root files (run node .github/scripts/starter-overlays.mjs)", () => {
  for (const overlay of deriveOverlays(read))
    assert.ok(
      sameOverlay(existsSync(overlay.source) ? read(overlay.source) : undefined, overlay),
      `${overlay.source} is stale`,
    );
});

test("every root and tooling path is a choice: written by minimal, or Figentra's furniture, or template-only", () => {
  const undecided = toolingPaths.filter(
    (path) => !minimal.has(path) && !matchesAny(path, FURNITURE) && !TEMPLATE_ONLY.has(path),
  );
  assert.deepEqual(undecided, []);
});

test("the internal profile keeps Figentra's setup for an app Figentra runs", () => {
  for (const path of [
    ".flow/lock.json",
    ".github/CODEOWNERS",
    ".github/workflows/fflow-approve.yml",
    ".github/workflows/deploy.yml",
    ".agents/hooks/fflow-guard.mjs",
    "flow.config.json",
  ])
    assert.equal(internal.get(path), path, `internal writes ${path}`);
  for (const path of ["package.json", ".npmrc", ".mcp.yaml", ".claude/settings.json"])
    assert.equal(internal.get(path), path, `internal keeps the root ${path}`);
  // The same app otherwise: the console and the service.
  for (const path of tracked.filter((file) => /^(apps\/console|services)\//.test(file)))
    assert.ok(minimal.has(path) && internal.has(path), `${path} in both`);
});

test("a transform drops what it names and refuses a Figentra token it cannot place", () => {
  const pkg = JSON.parse(
    transforms.packageJson(
      JSON.stringify({
        scripts: { "agents:setup": "x" },
        devDependencies: { "@figentra-oss/flow": "catalog:", a: "1" },
      }),
    ),
  );
  assert.deepEqual(pkg, { scripts: {}, devDependencies: { a: "1" } });
  assert.throws(
    () => transforms.lefthook("pre-push:\n  jobs:\n    - run: npx fflow gate\n"),
    /lefthook\.yml.*fflow/,
  );
  assert.throws(
    () => transforms.pnpmWorkspace('catalog:\n  "@figentra-oss/cli": 1.0.0\n'),
    /@figentra-oss/,
  );
  assert.throws(
    () => transforms.mcpYaml("mcpServers:\n  stackra:\n    command: pnpm\n"),
    /no encore, heroui-react/,
  );
  const settings = JSON.parse(
    transforms.claudeSettings(
      JSON.stringify({
        env: { GIT_EDITOR: "true", GIT_AUTHOR_NAME: "bot" },
        permissions: {
          allow: ["mcp__linear__get_*", "mcp__encore", "Bash(jq *)"],
          deny: ["Bash(figentra bot *)"],
        },
        hooks: { PreToolUse: [] },
      }),
    ),
  );
  assert.deepEqual(settings, {
    env: { GIT_EDITOR: "true" },
    permissions: { allow: ["mcp__encore", "Bash(jq *)"], deny: [] },
  });
});

test("the manifest reader keeps to its YAML subset", () => {
  assert.deepEqual(
    readYamlSubset('a: 1\nb:\n  - "x" # c\n  - from: y\n    to: "z#"\nc:\n  d: e\n'),
    {
      a: 1,
      b: ["x", { from: "y", to: "z#" }],
      c: { d: "e" },
    },
  );
  assert.throws(() => readYamlSubset("a: [x]\n"), /unsupported YAML/);
  assert.throws(() => readYamlSubset("a: &x y\n"), /unsupported YAML/);
});
