/**
 * Stackra file contract:
 * Purpose: the Props of `ProductGrid`: the output of the storefront listing (or the search, the
 *          same page shape), the collection the block was bound to and the cap.
 * Boundary: a type only; the output type is the commerce client's, never redeclared.
 * Runtime: browser
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: Props in
 *                     `<name>.props.ts`), ADR 0110 (a block's `accepts`)
 */
import type { QueryOutput } from "@stackra/clients";
import type { ListStorefrontProductsQuery } from "#stackra/clients/commerce";

/** Block props plus the bound query's output. */
export interface ProductGridProps {
  /** A storefront page (`{ items, nextCursor?, hasMore }`) from the listing or the search query. */
  readonly data: QueryOutput<typeof ListStorefrontProductsQuery>;
  /**
   * Collection slug the block was bound to; absent on the store page. Kept for the renderer's query
   * input.
   */
  readonly collection?: string;
  /** Cap on cards shown; the first row (4) is priority-loaded. */
  readonly limit: number;
}
