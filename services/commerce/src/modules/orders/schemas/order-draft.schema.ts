/**
 * Stackra file contract:
 * Purpose: `OrderDraft`: the order as the extension points see it: the customer (from the actor),
 *          the quote currency, priced lines and `extensions`, a map from an extending module's key
 *          to the input that module declared (`extensions.loyalty`).
 * Boundary: a shape class shared by the pricing service, the workflow and the extension point. Gen
 *           types `extensions` per extending module from each extension's `input` option.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26), ADR 0265 (typed extensions)
 */
import type { Json, PublicId } from "@stackra/contracts";
import type { CurrencyCode } from "@stackra/money";
import { List, Schema } from "@stackra/validation";
import type { PricedLine } from "#modules/orders/schemas/priced-line.schema";

/** A priced order that is not stored yet. */
export class OrderDraft extends Schema {
  /** The customer principal; set from the actor, never from input. */
  customerId!: PublicId<"usr">;

  /** ISO 4217 code the pricing service quoted in. */
  currency!: CurrencyCode;

  /** The lines with their quoted unit prices; at least one. */
  @List({ min: 1 })
  lines!: PricedLine[];

  /** Each extending module's own input, keyed by its module key. */
  extensions: Record<string, Json> = {};
}
