/**
 * Proves the refs-issue-key rule: off without a prefix, keyed types need `Refs: <PREFIX>-n`, unkeyed types do not,
 * and a different prefix does not satisfy it; the preset ships the rule off and is exported by its role
 * name as well as by default.
 */
import { describe, expect, it } from "vitest";
import preset, { commitlintPreset, refsIssueKey } from "../preset.ts";

const commit = (type: string, raw: string) => ({ type, raw });
const ok = (c: { type: string; raw: string }, prefix?: string) =>
  refsIssueKey(c, "always", prefix)[0];

describe("commitlintPreset", () => {
  it("is the named export and the default commitlint's `extends` loads", () => {
    expect(preset).toBe(commitlintPreset);
  });
});

describe("refs-issue-key", () => {
  it("is off in the preset and passes without a prefix", () => {
    expect(commitlintPreset.rules["refs-issue-key"]).toEqual([0]);
    expect(ok(commit("feat", "feat: x"))).toBe(true);
  });

  it("requires the footer on keyed types", () => {
    for (const type of ["feat", "fix", "refactor", "perf"]) {
      expect(ok(commit(type, `${type}: x`), "PROJ")).toBe(false);
      expect(ok(commit(type, `${type}: x\n\nRefs: PROJ-12`), "PROJ")).toBe(true);
    }
  });

  it("does not require it on unkeyed types", () => {
    expect(ok(commit("docs", "docs: x"), "PROJ")).toBe(true);
    expect(ok(commit("build", "build: x"), "PROJ")).toBe(true);
  });

  it("rejects a wrong prefix and accepts a configured one", () => {
    expect(ok(commit("fix", "fix: x\n\nRefs: ABC-1"), "PROJ")).toBe(false);
    expect(ok(commit("fix", "fix: x\n\nRefs: ABC-1"), "ABC")).toBe(true);
  });
});
