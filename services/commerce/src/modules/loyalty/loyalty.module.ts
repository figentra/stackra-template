/**
 * Stackra file contract:
 * Purpose: the loyalty module: commerce's use of @acme/loyalty-kit. It extends orders without
 *          editing orders.
 * Boundary: exports nothing. Its contributions are hooks (into orders), listeners (on orders
 *           events) and the LoyaltyMembers driver the kit needs. Gen infers loyalty → orders from
 *           the hook point it implements.
 * Runtime: node
 * Governing contract: ADR 0263, ADR 0265 (extension), guides/programming-model.mdx#modules
 */
import { Module } from "@stackra/container";

/**
 * `loyalty` owns the `loyalty_points` adjustment code and the `extensions.loyalty` namespace on
 * `orders.order.create`.
 */
@Module({ key: "loyalty" })
export class LoyaltyModule {}
