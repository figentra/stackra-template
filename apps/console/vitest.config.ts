/**
 * Stackra file contract:
 * Purpose: test config of @figentra/acme-console: the React (jsdom) vitest preset. `test` runs the unit tier; the
 *          infixed tiers (`.int`, `.contract`, `.e2e`, `.load`) run under their own tasks.
 * Boundary: test configuration only; a stand-in for the config gen will write into `.stackra/` for an app (ADR 0295
 *           decision 5).
 * Runtime: node
 * Governing contract: ADR 0295 (decision 5); ADR 0022 (test placement).
 */
import { stackraVitestReact } from "@stackra/vitest-config/preset-react";
import { defineConfig, mergeConfig } from "vitest/config";

export default mergeConfig(
  stackraVitestReact,
  defineConfig({
    test: {
      include: ["src/**/__tests__/**/*.test.{ts,tsx}"],
      exclude: ["**/*.{int,contract,e2e,load}.test.{ts,tsx}"],
    },
  }),
);
