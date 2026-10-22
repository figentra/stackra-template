/**
 * Stackra file contract:
 * Purpose: one tsdown entry: the root.
 * Boundary: entries only.
 * Runtime: node
 * Governing contract: ADR 0025
 */
import { library } from "@stackra/tsdown-config";

export default library({ index: "src/index.ts" });
