/**
 * Stackra file contract:
 * Purpose: `StorefrontProductPage`: one cursor page of storefront cards, the output of the
 *          storefront grid and of the storefront search.
 * Boundary: a shape class in schemas/ because two queries return it; `items`, `nextCursor` (absent
 *           on the last page) and `hasMore` come from `Page.of`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 13 and 26), cursor pagination in the HTTP conventions
 */
import { Page } from "@stackra/validation";
import { StorefrontProductCard } from "#modules/catalogue/schemas/storefront-product-card.schema";

/** `{ items: StorefrontProductCard[], nextCursor?, hasMore }`. */
export class StorefrontProductPage extends Page.of(StorefrontProductCard) {}
