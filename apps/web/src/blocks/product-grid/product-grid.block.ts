/**
 * Stackra file contract:
 * Purpose: registers `ProductGrid` as the page-builder block `web.product_grid`: a featured
 *          collection of products on a tenant landing page.
 * Boundary: a `@Block` class: the component and the props schema are options; the key is declared
 *           short and snake_case and gen prefixes the member key on the wire. `accepts` names the
 *           query whose output the component takes as `data`, batched by the renderer.
 * Runtime: isomorphic
 * Governing contract: ADR 0110 (L2: registered coded components, validated props), ADR 0231
 */
import { Block } from "@stackra/experience";
import { Commerce } from "#stackra/clients";
import { ProductGrid } from "#src/blocks/product-grid/product-grid";
import { ProductGridProps } from "#src/schemas/product-grid-props.schema";

/**
 * Page-builder block `web.product_grid`: a featured collection of products on a tenant landing
 * page.
 */
@Block({
  key: "product_grid",
  component: ProductGrid,
  props: ProductGridProps,
  accepts: Commerce.queries.ListStorefrontProducts,
})
export class ProductGridBlock {}
