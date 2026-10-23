/**
 * Stackra file contract:
 * Purpose: a responsive grid of product cards; the store page's body and the renderer of
 *          `ProductGridBlock`, bound by name.
 * Boundary: layout over the storefront listing output (the block's `accepts`); pagination is the
 *           route's, filtering is the query's.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 7 and 14, as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0110 (block with `accepts`)
 */
import { Component } from "@stackra/ui";
import { ProductCard } from "#src/components/product-card";
import type { ProductGridProps } from "./product-grid.props";

/** 2 columns on phones, 4 on desktop; a `<ul>` so the count is announced. */
export class ProductGrid extends Component<ProductGridProps> {
  /** Up to `limit` cards, the first row priority-loaded. */
  render() {
    const { data, limit } = this.props;
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
}
