/**
 * Stackra file contract:
 * Purpose: one tsdown entry: the root.
 * Boundary: entries only.
 * Runtime: node
 * Governing contract: ADR 0025
 */
import { libraryPreset } from "@stackra/tsdown-config";

export default libraryPreset({ index: "src/index.ts" });
