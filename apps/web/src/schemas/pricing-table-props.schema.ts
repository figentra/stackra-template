/**
 * Stackra file contract:
 * Purpose: the props of the `web.pricing_table` block: which product's ladder it shows; the plans
 *          arrive through `accepts`.
 * Boundary: one schema class.
 * Runtime: isomorphic
 * Governing contract: ADR 0110 d6, ADR 0242, ADR 0095
 */
import { Schema, z } from "@stackra/schema";

/** The product key of `billing.catalog.plan.list`. */
export class PricingTableProps extends Schema(z.object({ product: z.string() })) {}
