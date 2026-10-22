/**
 * Stackra file contract:
 * Purpose: test config of @stackra/typescript-config: the same settings as the `tooling` role of
 *          @stackra/vitest-config (plain Node, the `__tests__` unit tests under src, an empty suite fails).
 * Boundary: written out here because @stackra/vitest-config depends on this package, and a dependency
 *           back would be a workspace cycle.
 * Runtime: node
 * Governing contract: Stackra ADR 0022 (test placement)
 */
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { environment: "node", include: ["src/**/__tests__/**/*.test.ts"], passWithNoTests: false },
});
