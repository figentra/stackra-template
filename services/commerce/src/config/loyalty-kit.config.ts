/**
 * Stackra file contract:
 * Purpose: this service's override of @acme/loyalty-kit's configuration: a lower redemption cap.
 * Boundary: an override declares `override` members only and no new field; it inherits the base's
 *           key (`loyalty_kit`) and replaces the base across the whole host. The ledger stays the
 *           kit's default driver (`postgres`; runway sets `memory` in dev), and the members port
 *           has one candidate, commerce's own driver, so nothing selects it. A custom driver class
 *           would be bound with `@Replaces(LoyaltyLedger)`.
 * Runtime: node
 * Governing contract: ADR 0294 (decision 19), ADR 0146 (config layers), ADR 0263
 */
import { LoyaltyKitConfig } from "@acme/loyalty-kit";

/** Points may cover at most 30 % of an order, below the kit's 50 %. */
export class CommerceLoyaltyKitConfig extends LoyaltyKitConfig {
  /** Largest share of an order total points may cover, as a whole percentage. */
  override maxRedeemPercent = 30;
}
