/**
 * Stackra file contract:
 * Purpose: build config: one tsdown entry per package.json export (`.` is `index`); built to
 *          dist/*.mjs + .d.mts.
 * Boundary: entries only; typecheck and tests read source through `@stackra/source`.
 * Runtime: node
 * Governing contract: ADR 0025, ADR 0126 decision 2 (an entry is declared only with real code)
 */
import { libraryPreset } from "@stackra/tsdown-config";

export default libraryPreset({
  index: "src/index.ts",
  contracts: "src/contracts/index.ts",
  node: "src/node/index.ts",
  react: "src/react/index.ts",
  testing: "src/testing/index.ts",
});
