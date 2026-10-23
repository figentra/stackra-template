/**
 * Stackra file contract:
 * Purpose: a responsive grid of product cards; the store page's body and the renderer of
 *          `ProductGridBlock`, bound by name.
 * Boundary: layout over the storefront listing output (the block's `accepts`); pagination is the
 *           route's, filtering is the query's.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 7 and 14), ADR 0110 (block with `accepts`)
 */
import type { QueryOutput } from "@stackra/clients";
import type { Commerce } from "#stackra/clients";
import { ProductCard } from "#src/components/product-card";

/** Block props plus the bound query's output. */
export interface ProductGridProps {
  /** A storefront page (`{ items, nextCursor?, hasMore }`) from the listing or the search query. */
  readonly data: QueryOutput<typeof Commerce.queries.ListStorefrontProducts>;
  /**
   * Collection slug the block was bound to; absent on the store page. Kept for the renderer's query
   * input.
   */
  readonly collection?: string;
  /** Cap on cards shown; the first row (4) is priority-loaded. */
  readonly limit: number;
}

/** 2 columns on phones, 4 on desktop; a `<ul>` so the count is announced. */
export function ProductGrid({ data, limit }: ProductGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {data.items.slice(0, limit).map((product, index) => (
        <li key={product.id}>
          <ProductCard product={product} isPriority={index < 4} />
        </li>
      ))}
    </ul>
  );
}
