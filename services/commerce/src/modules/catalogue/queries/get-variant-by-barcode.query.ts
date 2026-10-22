/**
 * Stackra file contract:
 * Purpose: `catalogue.variant.get_by_barcode`: the variant behind a scanned barcode, for the mobile
 *          POS and stock count.
 * Boundary: read only; `not_found` for an unknown or archived barcode (never reveals which, ADR
 *           0140). Its risk is `ProductPermissions.read`'s, L0 (ADR 0132); `get` is the one-record
 *           verb of the key vocabulary (ADR 0231).
 * Runtime: node
 * Governing contract: ADR 0098, 0140, 0155, guides/programming-model.mdx#queries, ADR 0132, ADR
 *                     0231
 */
import { AsEndpoint, Query, type QueryContext } from "@stackra/actions";
import { ActorKind, HttpMethod } from "@stackra/contracts";
import type { Repository } from "@stackra/database";
import type { Variant } from "#modules/catalogue/models/variant.model";
import { ProductPermissions } from "#modules/catalogue/permissions/product.permission";
import { ProductStatus } from "#modules/catalogue/enums/product-status.enum";
import { GetVariantByBarcodeInput } from "#modules/catalogue/schemas/get-variant-by-barcode-input.schema";
import { VariantHit } from "#modules/catalogue/schemas/variant-hit.schema";
import { VariantNotFoundError } from "#modules/catalogue/errors/variant-not-found.error";

/**
 * One indexed lookup (`idx_variants_tenant_id_barcode`); the product is populated for the title.
 */
@Query({
  key: "variant.get_by_barcode",
  input: GetVariantByBarcodeInput,
  output: VariantHit,
  permission: ProductPermissions.read,
  actors: [ActorKind.User, ActorKind.Service],
  intents: ["what is this barcode", "scan item"],
})
@AsEndpoint({ method: HttpMethod.Get, path: "/variants/by-barcode/:barcode" })
export class GetVariantByBarcodeQuery {
  constructor(private readonly variants: Repository<Variant>) {}

  /**
   * Finds the sellable variant with this barcode and its product title.
   * @throws VariantNotFoundError when no Active product has a variant with this barcode.
   */
  async handle(input: GetVariantByBarcodeInput, ctx: QueryContext): Promise<VariantHit> {
    const v = await this.variants.findOne(
      { barcode: input.barcode, product: { status: ProductStatus.Active } },
      { populate: ["product"] },
    );
    if (!v) throw new VariantNotFoundError(input.barcode);
    return {
      variantId: v.id,
      productId: v.product.id,
      sku: v.sku,
      title: v.product.title.in(ctx.locale),
      trackInventory: v.trackInventory,
    };
  }
}
