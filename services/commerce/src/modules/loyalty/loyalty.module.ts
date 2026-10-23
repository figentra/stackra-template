/**
 * Stackra file contract:
 * Purpose: the loyalty module: commerce's use of @acme/loyalty-kit. It extends orders without
 *          editing orders.
 * Boundary: exports nothing, so it is the bare `Module`. Its contributions are extensions (of
 *           orders' extension point), listeners (on orders events) and the LoyaltyMembers driver
 *           the kit needs. Gen infers loyalty → orders from the point it extends and the service it
 *           injects, and loyalty → loyalty_kit from the kit's classes it injects.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 12, 13 and 16), ADR 0263, ADR 0265 (extensions)
 */
import { Module } from "@stackra/app";

/**
 * `loyalty` owns the `loyalty_points` adjustment code and the `extensions.loyalty` input of
 * `orders.order.create@1`.
 */
export class LoyaltyModule extends Module {}
