/**
 * Stackra file contract:
 * Purpose: `OrderLineDetail`: one packing-slip line: the priced line plus the variant's SKU and
 *          whether it still tracks inventory, read from catalogue through the line's link.
 * Boundary: a shape class; the element type of ListOrderLinesOutput. A nested element is a named
 *           class in schemas/, one declaration per file.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 2, 4, 8 and 28), ADR 0104
 */
import { PricedLine } from "#modules/orders/schemas/priced-line.schema";

/** A stored line joined with the catalogue facts a packer needs. */
export class OrderLineDetail extends PricedLine {
  /** The variant's stock-keeping unit, from catalogue. */
  sku!: string;

  /** Whether catalogue still tracks stock for the variant. */
  trackInventory!: boolean;
}
