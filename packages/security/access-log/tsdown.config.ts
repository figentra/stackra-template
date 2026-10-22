/**
 * Stackra file contract:
 * Purpose: one tsdown entry per package.json export.
 * Boundary: entries only.
 * Runtime: node
 * Governing contract: ADR 0025, 0126 decision 2
 */
import { library } from "@stackra/tsdown-config";

export default library({
  index: "src/index.ts",
  contracts: "src/contracts/index.ts",
  node: "src/node/index.ts",
  testing: "src/testing/index.ts",
});
