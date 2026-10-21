/**
 * Stackra file contract:
 * Purpose: the product search index: which product fields are searched and which can filter, for
 *          the storefront grid and the POS variant lookup.
 * Boundary: a declaration (`@SearchIndex`, @stackra/search); the Postgres hybrid driver keeps the
 *           index in step with the model through the unit of work, and `stackra db diff` writes its
 *           migration. New kind folder `search/`, suffix `.search.ts` (never `.index.ts`, FD 11).
 * Runtime: node
 * Governing contract: ADR 0221 (Postgres hybrid search), ADR 0160, ADR 0130
 */
import { SearchIndex } from "@stackra/search";
import { Product } from "#modules/catalogue/models/product.model";

/** Field paths are `keyof` the model (and of its populated relations), checked by gen. */
@SearchIndex(Product, {
  fields: ["title", "description", "variants.sku", "variants.barcode"],
  filters: ["status", "collections.slug"],
})
export class ProductSearch {}
