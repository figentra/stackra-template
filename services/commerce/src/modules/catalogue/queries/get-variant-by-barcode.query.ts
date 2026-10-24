/**
 * Stackra file contract:
 * Purpose: `catalogue.variant.get_by_barcode@1`: the variant behind a scanned barcode, for the
 *          mobile POS and stock count.
 * Boundary: read only; `variant_not_found` for an unknown or archived barcode alike, so it never
 *           reveals which (ADR 0140). The key's aggregate is `variant`, which has no permissions
 *           class, so the permission is named: `ProductPermissions.read`, L0 (ADR 0132). `get` is
 *           the one-record verb of the key vocabulary (ADR 0231). The path is kept as
 *           `/variants/by-barcode/:barcode` instead of the derived one. It reads through the
 *           generic Variant repository, because a named read here would have no other caller.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 2, 16 and 21), ADR 0098, ADR 0140, ADR 0155, ADR 0231
 */
import { Query, type QueryContext } from "@stackra/actions";
import { ActorKind, HttpMethod } from "@stackra/contracts";
import type { Repository } from "@stackra/database";
import { ProductPermissions } from "#modules/catalogue/access/product.permissions";
import { ProductStatus } from "#modules/catalogue/enums/product-status.enum";
import { VariantNotFoundError } from "#modules/catalogue/errors/variant-not-found.error";
import type { Variant } from "#modules/catalogue/models/variant.model";
import type { GetVariantByBarcodeInput } from "#modules/catalogue/schemas/get-variant-by-barcode-input.schema";
import { VariantHit } from "#modules/catalogue/schemas/variant-hit.schema";

/** One indexed lookup (`idx_variants_tenant_id_barcode`), with the product for its title. */
export class GetVariantByBarcodeQuery extends Query({
  key: "variant.get_by_barcode",
  permission: ProductPermissions.read,
  actors: [ActorKind.User, ActorKind.Service],
  intent: true,
  endpoint: {
    method: HttpMethod.Get,
    path: "/variants/by-barcode/:barcode",
  },
}) {
  /**
   * @param variants - the generic repository of Variant.
   */
  constructor(private readonly variants: Repository<Variant>) {
    super();
  }

  /**
   * Finds the sellable variant with this barcode and its product title.
   * @throws VariantNotFoundError when no active product has a variant with this barcode.
   */
  async handle(input: GetVariantByBarcodeInput, ctx: QueryContext): Promise<VariantHit> {
    const variant = await this.variants.findOne(
      { barcode: input.barcode, product: { status: ProductStatus.Active } },
      { populate: ["product"] },
    );
    if (!variant) throw VariantNotFoundError.create({ barcode: input.barcode });
    // populated above, so `$` is the loaded product
    const product = variant.product.$;
    return VariantHit.create({
      variantId: variant.id,
      productId: product.id,
      sku: variant.sku,
      title: product.title.in(ctx.locale),
      trackInventory: variant.trackInventory,
    });
  }
}
