/**
 * Stackra file contract:
 * Purpose: `StorefrontProductPage`: one cursor page of storefront cards, the grid's output.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0082 (public area), ADR 0221 (hybrid search),
 *                     guides/programming-model.mdx#schemas; apps/web product and store routes
 */
import { Page } from "@stackra/schema";
import { StorefrontProductCard } from "#modules/catalogue/schemas/storefront-product-card.schema";

/** `{ items: StorefrontProductCard[], nextCursor?, hasMore }`. */
export class StorefrontProductPage extends Page(StorefrontProductCard) {}
