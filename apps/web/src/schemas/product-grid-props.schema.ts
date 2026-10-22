/**
 * Stackra file contract:
 * Purpose: the props of the `web.product_grid` block: the collection to feature and how many cards
 *          to show.
 * Boundary: one schema class; the cards arrive through `accepts`.
 * Runtime: isomorphic
 * Governing contract: ADR 0110 d6, ADR 0095
 */
import { Schema, z } from "@stackra/schema";

/** A collection slug and a cap of one to twelve cards. */
export class ProductGridProps extends Schema(
  z.object({ collection: z.string(), limit: z.number().int().min(1).max(12).default(4) }),
) {}
