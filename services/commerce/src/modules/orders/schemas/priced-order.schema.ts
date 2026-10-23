/**
 * Stackra file contract:
 * Purpose: `PricedOrder`: the priced draft and its totals, the result of CreateOrderWorkflow's
 *          `price` step that the later steps read.
 * Boundary: a shape class, because a step result is stored with the run and read back on resume; a
 *           named class in schemas/, one declaration per file.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 2, 8 and 18), ADR 0152 (durable runs)
 */
import { Schema } from "@stackra/validation";
import type { OrderDraft } from "#modules/orders/schemas/order-draft.schema";
import type { OrderTotals } from "#modules/orders/schemas/order-totals.schema";

/** A draft that has passed the sellable check, the extensions and the verification. */
export class PricedOrder extends Schema {
  /** The priced, verified draft. */
  draft!: OrderDraft;

  /** Its totals after every `adjustTotals` extension. */
  totals!: OrderTotals;
}
