/**
 * Stackra file contract:
 * Purpose: a sellable variant of a product (size, colour); the unit orders and inventory refer to
 *          by public id.
 * Boundary: data only. Orders and stock levels store `var_…` ids, never a foreign key into this
 *           table.
 * Runtime: node
 * Governing contract: ADR 0095, 0097, guides/programming-model.mdx#models
 */
import { BelongsTo, Bool, Index, Json, Model, Nullable, Str } from "@stackra/model";
import { BelongsToTenant, HasPublicId, Timestamps } from "@stackra/model/traits";
import { Product } from "#modules/catalogue/models/product.model";

/** Key `catalogue.variant`, table `variants`; barcode unique per tenant for the POS lookup. */
@Model()
@Index(["tenantId", "sku"], { unique: true }) // → idx_variants_tenant_id_sku
// → idx_variants_tenant_id_barcode; nulls distinct
@Index(["tenantId", "barcode"], { unique: true })
export class Variant extends Model.with(HasPublicId("var"), BelongsToTenant, Timestamps) {
  /** The owning product; a variant sells only while its product is Active. */
  @BelongsTo(() => Product) product!: Product;
  /**
   * Merchant's stock-keeping unit, unique per tenant; shown in the console and on packing slips.
   */
  @Str({ max: 64 }) sku!: string;
  /**
   * GTIN/EAN as printed on the pack; null for variants sold without a barcode. Scanned by the
   * mobile POS.
   */
  @Nullable() @Str({ max: 14 }) barcode!: string | null;
  /**
   * When false, inventory never reserves or refuses stock for this variant (services, digital
   * goods).
   */
  @Bool() trackInventory!: boolean;
  /**
   * Option values that tell variants of one product apart (`{ size: "M", colour: "navy" }`); the
   * storefront picker reads them.
   */
  @Json() options!: Record<string, string>;
}
