/**
 * Stackra file contract:
 * Purpose: the fact that a pending order exists with its stock reserved; payment not yet
 *          authorized. Leaves through the outbox as `orders.order.placed.v1`.
 * Boundary: an integration event: typed fields, built only with `OrderPlaced.create`, recorded by
 *           OrderService#createPending and nowhere else. Carries ids, the total and the lines, so
 *           the confirmation notification and loyalty need no second read.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 5, 16 and 20), ADR 0141 (names and envelope), ADR 0078
 *                     (outbox)
 */
import type { PublicId } from "@stackra/contracts";
import { IntegrationEvent } from "@stackra/events";
import type { CurrencyCode } from "@stackra/money";
import { Int } from "@stackra/validation";
import type { RequestedLine } from "#modules/orders/schemas/requested-line.schema";

/** Consumed by loyalty (redeem) and by OrderPlacedNotification (the confirmation). */
export class OrderPlaced extends IntegrationEvent({ name: "order.placed" }) {
  /** The new order. */
  orderId!: PublicId<"ord">;

  /** The customer who placed it. */
  customerId!: PublicId<"usr">;

  /** Amount to be charged, in minor units. */
  @Int({ min: 0 })
  totalMinor!: number;

  /** ISO 4217 code of `totalMinor`. */
  currency!: CurrencyCode;

  /** What was ordered. */
  lines!: RequestedLine[];
}
