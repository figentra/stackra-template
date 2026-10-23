/**
 * Proves every preset listed in package.json `exports` exists, parses as JSONC, and resolves its
 * `extends` chain back to base.json — so a broken preset fails here, not in the first consumer's typecheck —
 * that the five member roles are exported under one spelling, without `.json`, and that the class
 * semantics the kind bases rely on hold (ADR 0300 decision 6).
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
  exports: Record<string, string>;
};

/** Strip `//` line comments so JSONC presets parse with JSON.parse. */
function readJsonc(path: string): { extends?: string; compilerOptions?: Record<string, unknown> } {
  const text = readFileSync(path, "utf8")
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("//"))
    .join("\n");
  return JSON.parse(text);
}

describe("@stackra/typescript-config presets", () => {
  for (const [subpath, file] of Object.entries(pkg.exports)) {
    it(`${subpath} → ${file} exists and chains to base.json`, () => {
      let current = join(root, file);
      const seen = new Set<string>();
      while (true) {
        expect(existsSync(current), `${current} missing`).toBe(true);
        expect(seen.has(current), `cycle at ${current}`).toBe(false);
        seen.add(current);
        const preset = readJsonc(current);
        if (!preset.extends) {
          expect(current.endsWith("base.json")).toBe(true);
          break;
        }
        current = join(dirname(current), preset.extends);
      }
    });
  }

  it("exports the five member roles, each under one spelling without .json", () => {
    const subpaths = Object.keys(pkg.exports);
    for (const role of ["app", "mobile", "library", "service", "tooling"]) {
      expect(subpaths, role).toContain(`./${role}`);
    }
    expect(subpaths.filter((subpath) => subpath.endsWith(".json"))).toEqual([]);
  });

  it("base keeps the non-negotiable strictness flags", () => {
    const base = readJsonc(join(root, "src", "base.json")).compilerOptions ?? {};
    for (const flag of [
      "strict",
      "noUncheckedIndexedAccess",
      "exactOptionalPropertyTypes",
      "noImplicitOverride",
      "useDefineForClassFields",
      "isolatedModules",
      "verbatimModuleSyntax",
    ]) {
      expect(base[flag], flag).toBe(true);
    }
  });

  /** Isolated declarations refuse a called kind base (`extends Action({ key })`). */
  it("no preset turns on isolatedDeclarations", () => {
    for (const file of new Set(Object.values(pkg.exports))) {
      expect(readJsonc(join(root, file)).compilerOptions?.isolatedDeclarations, file).not.toBe(
        true,
      );
    }
  });
});
