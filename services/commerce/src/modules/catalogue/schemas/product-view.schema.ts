/**
 * Stackra file contract:
 * Purpose: `ProductView`: a product as the API and the console see it: public ids, the title in the
 *          request locale, the status and the variants' ids and SKUs.
 * Boundary: a shape class (an output view, so `<X>View`); never the model. In schemas/ because the
 *           service, both actions, the read query and the generated operations return it. Built
 *           only by ProductService#toView.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 13 and 26)
 */
import type { PublicId } from "@stackra/contracts";
import { Schema } from "@stackra/validation";
import type { ProductStatus } from "#modules/catalogue/enums/product-status.enum";
import type { VariantSummary } from "#modules/catalogue/schemas/variant-summary.schema";

/** The admin-area view; the storefront reads StorefrontProductView instead. */
export class ProductView extends Schema {
  /** The product's public id (`prd_…`). */
  id!: PublicId<"prd">;

  /** The title in the request locale. */
  title!: string;

  /** The URL segment. */
  slug!: string;

  /** The sale state. */
  status!: ProductStatus;

  /** Every variant, by id and SKU. */
  variants!: VariantSummary[];
}
