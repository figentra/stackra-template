/**
 * Stackra file contract:
 * Purpose: tests of .github/scripts/registry-probe.mjs and of its wiring in ci.yml: a registry or network error fails
 *          the job, an unpublished `@stackra/cli` pin fails it unless the explicit pre-release flag is "true", and the
 *          Quality Gate runs the script with the flag set to "false" and no way for the step to swallow a failure.
 * Boundary: the pure functions and the workflow text; the npm call itself runs in the Quality Gate.
 * Runtime: node (`node --test ".github/scripts/__tests__/*.test.mjs"`, the `scripts` check of preview-gate.mjs)
 * Governing contract: Stackra ADR 0019 (a check that cannot run fails), ADR 0013 (exact catalog pins). STA-2884.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { REGISTRY_PROBE } from "../registry-probe.mjs";

const { cliPin, preRelease, classify, decide } = REGISTRY_PROBE;

/** npm's `--json` error body, as it prints it on stdout. */
const npmError = (code, summary) => JSON.stringify({ error: { code, summary, detail: "…" } });

test("the pin is the exact @stackra/cli version of catalog stackra", () => {
  assert.equal(cliPin('catalogs:\n  stackra:\n    "@stackra/cli": 0.33.1\n'), "0.33.1");
  assert.equal(cliPin('    "@stackra/cli": 1.2.3-next.4\n'), "1.2.3-next.4");
  assert.throws(() => cliPin('    "@stackra/app": 0.33.1\n'), /pins no "@stackra\/cli"/);
  assert.throws(() => cliPin('    "@stackra/cli": ^0.33.1\n'), /not an exact version/);
});

test('the pre-release flag is off unless it is exactly "true"; a typo is refused', () => {
  assert.equal(preRelease(undefined), false);
  assert.equal(preRelease(""), false);
  assert.equal(preRelease("false"), false);
  assert.equal(preRelease("true"), true);
  for (const value of ["1", "yes", "TRUE", "ture"])
    assert.throws(() => preRelease(value), TypeError);
});

test("npm answering the pinned version is published", () => {
  assert.equal(classify({ status: 0, stdout: '"0.33.1"\n' }, "0.33.1").state, "published");
});

test("a 404 from the registry is unpublished", () => {
  const run = { status: 1, stdout: npmError("E404", "No match found for version 9.9.9") };
  assert.deepEqual(classify(run, "9.9.9"), {
    state: "unpublished",
    reason: "No match found for version 9.9.9",
  });
});

test("every other answer is a probe error, never 'unpublished'", () => {
  const cases = [
    { status: 1, stdout: npmError("ENOTFOUND", "getaddrinfo ENOTFOUND npm.stackra.figentra.com") },
    { status: 1, stdout: npmError("E401", "Unable to authenticate") },
    { status: 1, stdout: npmError("E503", "Service Unavailable") },
    { status: 1, stdout: npmError("ETIMEDOUT", "network timeout") },
    { status: 1, stdout: "" },
    { status: 1, stdout: "npm ERR! something" },
    { status: 0, stdout: "" },
    { status: 0, stdout: '"0.33.0"' },
    { error: new Error("spawnSync npm ENOENT") },
  ];
  for (const run of cases)
    assert.equal(classify(run, "0.33.1").state, "error", JSON.stringify(run));
});

test("published runs the full gate", () => {
  const verdict = decide({ state: "published", reason: "" }, "@stackra/cli@0.33.1", false);
  assert.equal(verdict.ok, true);
  assert.equal(verdict.published, true);
});

test("a probe error fails the job, with or without the pre-release flag", () => {
  for (const flag of [false, true]) {
    const verdict = decide({ state: "error", reason: "E503: down" }, "@stackra/cli@0.33.1", flag);
    assert.equal(verdict.ok, false);
    assert.equal(verdict.published, false);
    assert.equal(verdict.level, "error");
    assert.match(verdict.message, /never skips the gate/);
  }
});

test("unpublished fails the job unless the pre-release flag is set", () => {
  const unpublished = { state: "unpublished", reason: "No match found for version 9.9.9" };
  const closed = decide(unpublished, "@stackra/cli@9.9.9", false);
  assert.equal(closed.ok, false);
  assert.match(closed.message, /STACKRA_PRE_RELEASE: "true"/);
  const open = decide(unpublished, "@stackra/cli@9.9.9", true);
  assert.equal(open.ok, true);
  assert.equal(open.published, false);
});

test("ci.yml runs the probe script with the pre-release flag explicitly off and nothing swallowing a failure", () => {
  const workflow = readFileSync(new URL("../../workflows/ci.yml", import.meta.url), "utf8");
  const start = workflow.indexOf("      - name: Registry probe\n");
  assert.ok(start > 0, "ci.yml has a Registry probe step");
  const end = workflow.indexOf("\n      - name: ", start + 1);
  const step = workflow.slice(start, end);
  assert.match(step, /^ {8}id: registry$/m);
  assert.match(step, /^ {10}STACKRA_PRE_RELEASE: "false"$/m);
  assert.match(step, /^ {8}run: node \.github\/scripts\/registry-probe\.mjs$/m);
  assert.doesNotMatch(step, /continue-on-error|\|\| *true|published=false/);
  // The install-based steps still key off the probe's output.
  assert.match(workflow, /if: steps\.registry\.outputs\.published == 'true'/);
});

test("deploy.yml guards the template under both organisations, then runs the same fail-closed probe", () => {
  const workflow = readFileSync(new URL("../../workflows/deploy.yml", import.meta.url), "utf8");
  assert.match(workflow, /figentra\/stackra-template \| stackra-inc\/stackra-template\)/);
  const start = workflow.indexOf("      - name: Registry probe\n");
  assert.ok(start > 0, "deploy.yml has a Registry probe step");
  const step = workflow.slice(start, workflow.indexOf("\n  # ", start));
  assert.match(step, /^ {8}if: steps\.guard\.outputs\.deploy == 'true'$/m);
  assert.match(step, /^ {10}STACKRA_PRE_RELEASE: "false"$/m);
  assert.match(step, /^ {8}run: node \.github\/scripts\/registry-probe\.mjs$/m);
  assert.doesNotMatch(step, /continue-on-error|\|\| *true|published=false/);
  assert.doesNotMatch(
    workflow,
    /npm view .*>\/dev\/null 2>&1/,
    "no probe that swallows npm's error",
  );
});
