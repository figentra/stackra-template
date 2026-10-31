/**
 * Stackra file contract:
 * Purpose: tests of `driftOf`, the parser of `stackra new --over` output in .github/scripts/example-drift.mjs.
 * Boundary: the pure parser only; the `stackra new` run itself is covered by the cli's own tests.
 * Runtime: node (`node --test ".github/scripts/__tests__/*.test.mjs"`, the `scripts` check of preview-gate.mjs)
 * Governing contract: stackra-15 (STA-1068); STA-1210 (`--over` output: `--- <file>` diffs and `wrote <file>`)
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import { driftOf } from "../example-drift.mjs";

test("a member equal to the template has no drift", () => {
  assert.deepEqual(driftOf("regenerated services/example\nnext: `pnpm install`\n"), []);
});

test("a differing authored file and a written missing file are drift", () => {
  const output = [
    "--- services/example/package.json (authored, kept)",
    "+++ template",
    "-  old",
    "+  new",
    "wrote services/example/assets/.gitkeep",
    "regenerated services/example",
  ].join("\n");
  assert.deepEqual(driftOf(output), [
    "--- services/example/package.json (authored, kept)",
    "wrote services/example/assets/.gitkeep",
  ]);
});
