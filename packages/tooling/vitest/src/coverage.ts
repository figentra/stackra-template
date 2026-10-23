/**
 * Stackra file contract:
 * Purpose: the ONE coverage gate for the workspace packages. Every package's generated
 *          `.stackra/vitest.config.ts` gets it through `libraryPreset()`, which wraps its config in
 *          `withCoverage()`; `pnpm test:coverage` runs `vitest run --coverage` against these
 *          thresholds (no CI step runs it while @stackra/* is unpublished). Apps are NOT gated
 *          here. Provider: @vitest/coverage-v8.
 * Boundary: the shared coverage block and its wrapper; it runs no tests itself.
 * Runtime: node
 * Governing contract: ADR 0007 (documentation); ADR 0022 (test placement).
 * Change policy: a threshold moves only upward, in a changeset; a package that cannot meet it
 *                records the lower threshold and its reason in its stackra.config.ts (a build-tool
 *                fact, ADR 0295 decision 4), and its generated vitest config passes it to
 *                `withCoverage`.
 */
import type { ViteUserConfig as UserConfig } from "vitest/config";

type CoverageOptions = NonNullable<NonNullable<UserConfig["test"]>["coverage"]>;

/** Lines/functions 80, branches 70 — the floor every package meets. */
export const COVERAGE_THRESHOLDS = Object.freeze({ lines: 80, functions: 80, branches: 70 });

/**
 * The shared `test.coverage` block.
 * - `include: src/**` — an untested file counts (the v8 default only sees what a test imported).
 * - `src/encore/**` is excluded: the Encore-bound half of a package cannot load outside the Encore runtime.
 * - generated files, entry barrels (generated, never authored), type-only, bin and test files carry
 *   no logic to measure.
 */
export const coverage = Object.freeze({
  provider: "v8",
  enabled: false,
  include: ["src/**/*.{ts,tsx}"],
  exclude: [
    "src/**/__tests__/**",
    "src/**/*.test.{ts,tsx}",
    "src/**/*.d.ts",
    "src/**/index.{ts,tsx}",
    "src/generated/**",
    "src/encore/**",
    "src/**/__fixtures__/**",
    "src/**/testing/**",
    "src/bin/**",
  ],
  reporter: ["text-summary", "json-summary", "cobertura", "html"],
  reportsDirectory: "./coverage",
  reportOnFailure: true,
  thresholds: { ...COVERAGE_THRESHOLDS },
} satisfies CoverageOptions);

/** The per-package changes `withCoverage` applies on top of the shared block. Each one needs a reason in the package. */
export interface CoverageOverrides {
  /** Additional exclude globs appended to the shared list. */
  exclude?: string[];
  /** Lower a threshold — only with a documented reason beside the package's override. */
  thresholds?: Partial<typeof COVERAGE_THRESHOLDS>;
}

/** Wrap a package's vitest config with the shared coverage block. */
export function withCoverage<T extends UserConfig>(
  config: T,
  overrides: CoverageOverrides = {},
): T {
  return {
    ...config,
    test: {
      ...config.test,
      coverage: {
        ...coverage,
        exclude: [...coverage.exclude, ...(overrides.exclude ?? [])],
        thresholds: { ...coverage.thresholds, ...overrides.thresholds },
      },
    },
  };
}
