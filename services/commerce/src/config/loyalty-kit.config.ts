/**
 * Stackra file contract:
 * Purpose: this service's host layer over @acme/loyalty-kit's defaults (package → host → env →
 *          runway).
 * Boundary: only what differs from the package. The ledger stays the kit's default (`postgres`;
 *           runway sets `memory` in dev); the members port has one candidate, commerce's own
 *           driver, so nothing selects it (ADR 0263, ADR 0266). A custom class would be
 *           `@Replaces`.
 * Runtime: node
 * Governing contract: ADR 0146, ADR 0263 d9 (config is data),
 *                     guides/programming-model.mdx#config-files, ADR 0266
 */
import { override } from "@stackra/config";
import { LoyaltyKitConfig } from "@acme/loyalty-kit";

/** A lower redemption cap than the kit's 50 %: points may cover at most 30 % of an order. */
export default override(LoyaltyKitConfig, { maxRedeemPercent: 30 });
