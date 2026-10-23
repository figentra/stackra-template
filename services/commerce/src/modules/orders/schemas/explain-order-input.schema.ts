/**
 * Stackra file contract:
 * Purpose: `ExplainOrderInput`: the arguments of the `explain-order` MCP prompt.
 * Boundary: a shape class in schemas/, one declaration per file; gen writes its JSON Schema into
 *           the MCP prompt listing.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0245
 */
import type { PublicId } from "@stackra/contracts";
import { Schema } from "@stackra/validation";

/** The order to explain, by public id. */
export class ExplainOrderInput extends Schema {
  /** The order's public id. */
  orderId!: PublicId<"ord">;
}
