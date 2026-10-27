/**
 * Stackra file contract:
 * Purpose: a sellable variant of a product (size, colour): the unit orders and inventory refer to
 *          by public id.
 * Boundary: data, the relation to its product and indexes. Key `catalogue.variant`, table
 *           `catalogue.variants`, public ids `var_…`. The product is a same-module relation
 *           (`Ref<Product>`, foreign key, cascade). Orders reach a variant through a
 *           `Link<Variant>` (an indexed id, no foreign key) and inventory stores its public id;
 *           neither joins this table.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 11, 20, 27 and 28), ADR 0104 (as amended)
 */
import {
  HasPublicId,
  Index,
  ManyToOne,
  Model,
  OnDelete,
  type Ref,
  Timestamps,
} from "@stackra/model";
import { BelongsToTenant } from "@stackra/tenancy/node";
import { Str } from "@stackra/validation";
import { Product } from "#modules/catalogue/models/product.model";

/** The SKU and the barcode are unique per tenant; Postgres treats each null barcode as distinct. */
@Index(["tenantId", "sku"], { unique: true })
@Index(["tenantId", "barcode"], { unique: true })
export class Variant extends Model.with(HasPublicId("var"), BelongsToTenant, Timestamps) {
  /** The owning product; foreign key `fk_variants_product_id`, deleted with the product. */
  @ManyToOne(() => Product, { onDelete: OnDelete.Cascade })
  product!: Ref<Product>;

  /** Merchant's stock-keeping unit; shown in the console and on packing slips. */
  @Str({ max: 64 })
  sku!: string;

  /** GTIN or EAN as printed on the pack, scanned by the mobile POS; null without one. */
  @Str({ max: 14 })
  barcode: string | null = null;

  /** When false, inventory never reserves or refuses stock for it (services, digital goods). */
  trackInventory = true;

  /** Option values that tell variants apart (`{ size: "M", colour: "navy" }`), for the picker. */
  options: Record<string, string> = {};
}
