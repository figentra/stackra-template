/**
 * Stackra file contract:
 * Purpose: `RequestedLine`: a catalogue variant and how many units of it, as a caller asks for it
 *          and as `order.placed` reports it.
 * Boundary: a shape class; gen compiles it to `RequestedLine$` in `#stackra/schemas`. Shared by the
 *           create input, PricedLine and the OrderPlaced event, so it lives in schemas/.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 13 and 26)
 */
import type { PublicId } from "@stackra/contracts";
import { Int, Schema } from "@stackra/validation";

/** One line of an order before it is priced. */
export class RequestedLine extends Schema {
  /** Public id of the catalogue variant; catalogue owns the row. */
  variantId!: PublicId<"var">;

  /** Units requested; at least one. */
  @Int({ min: 1 })
  quantity!: number;
}
