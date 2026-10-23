/**
 * Stackra file contract:
 * Purpose: the page-builder block `web.product_grid`: a featured collection of products on a tenant
 *          landing page.
 * Boundary: the class is the props shape a document may pass (the collection and the cap);
 *           `accepts` names the query whose output the renderer takes as `data`, batched by the
 *           document renderer with the collection as its input. Its renderer is `product-grid.tsx`,
 *           bound by name; the key is derived from the folder.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 14, 16 and 20, as amended by programming model v3.1,
 *                     AGENTS.md: icon names and client classes), ADR 0110 (registered coded blocks)
 */
import { Block, BlockCategory } from "@stackra/experience";
import { Int } from "@stackra/validation";
import { ListStorefrontProductsQuery } from "#stackra/clients/commerce";

/** A collection slug and a cap of one to twelve cards. */
export class ProductGridBlock extends Block({
  category: BlockCategory.Commerce,
  icon: "package",
  accepts: ListStorefrontProductsQuery,
}) {
  /** The collection slug the grid features; the renderer's query input. */
  collection!: string;

  /** Cap on cards shown; the first row (4) is priority-loaded. */
  @Int({
    min: 1,
    max: 12,
  })
  limit = 4;
}
