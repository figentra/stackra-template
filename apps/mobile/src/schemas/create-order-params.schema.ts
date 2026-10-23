/**
 * Stackra file contract:
 * Purpose: the params of `CreateOrderRoute`: an optional variant to pre-fill, as the scanner hands
 *          it over.
 * Boundary: a schema class: the field types are the rules and gen compiles them; everything is
 *           optional, so `orders/new` opens an empty sheet.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 16), ADR 0082
 */
import type { PublicId } from "@stackra/contracts";
import { Schema } from "@stackra/validation";

/** The create-order screen's params, such as `orders/new?variantId=var_…`. */
export class CreateOrderParams extends Schema {
  /** The scanned variant's public id; absent when the sheet opens from Home. */
  variantId?: PublicId<"var">;
}
