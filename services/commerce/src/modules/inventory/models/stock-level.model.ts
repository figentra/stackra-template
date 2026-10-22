/**
 * Stackra file contract:
 * Purpose: on-hand and reserved units of one variant at one location.
 * Boundary: references a catalogue variant by public id; a cross-module read would go through a
 *           @Link (ADR 0104). `Versioned` gives optimistic locking; StockService adds an advisory
 *           lock around reservations.
 * Runtime: node
 * Governing contract: ADR 0095, 0104, 0133, guides/programming-model.mdx#models
 */
import { Index, Int, Model, Str } from "@stackra/model";
import { BelongsToTenant, HasPublicId, Timestamps, Versioned } from "@stackra/model/traits";

/**
 * Key `inventory.stock_level`, table `stock_levels`; one row per (tenant, variant, location).
 * Public ids are `stk_…`.
 */
@Model()
// → idx_stock_levels_tenant_id_variant_id_location_id
@Index(["tenantId", "variantId", "locationId"], { unique: true })
export class StockLevel extends Model.with(
  HasPublicId("stk"),
  BelongsToTenant,
  Timestamps,
  Versioned,
) {
  /** Public id (`var_…`) of the catalogue variant; catalogue owns the variant row. */
  @Str({ max: 64 }) variantId!: string;
  /** Public id of the warehouse or shop. */
  @Str({ max: 64 }) locationId!: string;
  /** Physical units counted at the location, set by `stock.adjust`. */
  @Int({ min: 0 }) onHand!: number;
  /** Units held for pending orders; raised by reserve, lowered by release. */
  @Int({ min: 0 }) reserved!: number;

  /** Units still sellable. Invariant: never negative while backorders are off. */
  get available(): number {
    return this.onHand - this.reserved;
  }

  /**
   * The advisory-lock key StockService.reserve takes per variant, so two orders for the same
   * variant serialise while orders for different variants run in parallel (ADR 0149).
   */
  static lockKey(variantId: string): string {
    return `inventory.stock_level:${variantId}`;
  }
}
