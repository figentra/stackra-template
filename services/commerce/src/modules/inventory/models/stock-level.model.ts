/**
 * Stackra file contract:
 * Purpose: on-hand and reserved units of one variant at one location.
 * Boundary: data, the index and two derived reads. Key `inventory.stock_level`, table
 *           `inventory.stock_levels` (the module's Postgres schema), public ids `stk_…`. The
 *           variant belongs to catalogue and is held as its public id, not as a relation, so
 *           inventory never reads catalogue's table. `Versioned` gives optimistic locking;
 *           StockService adds an advisory lock around reservations. No constructor-made state: a
 *           getter and a static are computed, never stored.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 11, 20 and 27), ADR 0133 (traits), ADR 0149 (locking)
 */
import type { PublicId } from "@stackra/contracts";
import { HasPublicId, Index, Model, Timestamps, Versioned } from "@stackra/model";
import { BelongsToTenant } from "@stackra/tenancy/node";
import { Int, Str } from "@stackra/validation";

/** One row per tenant, variant and location, enforced by a unique index. */
@Index(["tenantId", "variantId", "locationId"], { unique: true })
export class StockLevel extends Model.with(
  HasPublicId("stk"),
  BelongsToTenant,
  Timestamps,
  Versioned,
) {
  /** Public id of the catalogue variant; catalogue owns the variant row. */
  variantId!: PublicId<"var">;

  /** Public id of the warehouse or shop. */
  @Str({ max: 64 })
  locationId!: string;

  /** Physical units counted at the location, set by `inventory.stock.adjust`. */
  @Int({ min: 0 })
  onHand = 0;

  /** Units held for pending orders; raised by reserve, lowered by release. */
  @Int({ min: 0 })
  reserved = 0;

  /**
   * Units still sellable. Invariant: never negative while backorders are off.
   */
  get available(): number {
    return this.onHand - this.reserved;
  }

  /**
   * The advisory-lock key StockService#reserve takes per variant, so two orders for the same
   * variant serialise while orders for different variants run in parallel (ADR 0149).
   */
  static lockKey(variantId: PublicId<"var">): string {
    return `inventory.stock_level:${variantId}`;
  }
}
