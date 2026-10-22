/**
 * Stackra file contract:
 * Purpose: stock reservation for orders. Called as a workflow step by orders, with `release` as its
 *          compensation.
 * Boundary: exported to sibling modules (orders reserves, catalogue reads `available`). Runs inside
 *           the caller's transaction; never calls the network. The event is recorded on the
 *           aggregate and dispatched after commit.
 * Runtime: node
 * Governing contract: ADR 0149 (locking), 0101 (workflow steps call module services), 0141,
 *                     guides/programming-model.mdx#services
 */
import { Repository } from "@stackra/database";
import { WithLock } from "@stackra/locking";
import { SettingsReader } from "@stackra/settings";
import { StockLevel } from "#modules/inventory/models/stock-level.model";
import { StockLow } from "#modules/inventory/events/stock-low.event";
import { InventorySettings } from "#modules/inventory/settings/inventory.setting";
import { InsufficientStockError } from "#modules/inventory/errors/insufficient-stock.error";

/**
 * What a caller wants held or released: a variant by public id and a unit count. Location is the
 * tenant default.
 */
export interface StockLine {
  /** Public id of the catalogue variant. */
  readonly variantId: string;
  /** Units to reserve or release; positive. */
  readonly quantity: number;
}

/**
 * Reservations are the module's only write path besides the adjust action. `reserve` and `release`
 * are a pair:
 * whoever reserves owns the matching release (orders does it through workflow compensation and
 * cancel).
 */
export class StockService {
  /** @param settings - threshold and backorder policy are read per call, for the current tenant. */
  constructor(
    private readonly levels: Repository<StockLevel>,
    private readonly settings: SettingsReader,
  ) {}

  /**
   * Reserves every line or none, at the default location, under one advisory lock per variant (keys
   * sorted by the lock
   * driver, so two overlapping orders never deadlock). Records `stock.low` on each variant that
   * crosses the threshold.
   * @throws InsufficientStockError naming the first variant that cannot be covered.
   */
  @WithLock({
    keys: (lines: readonly StockLine[]) => lines.map((l) => StockLevel.lockKey(l.variantId)),
    ttl: "5s",
  })
  async reserve(lines: readonly StockLine[]): Promise<void> {
    const { lowStockThreshold, allowBackorders } = await this.settings.for(InventorySettings);
    for (const line of lines) {
      const level = await this.levels.findOneOrFail({ variantId: line.variantId });
      if (!allowBackorders && level.available < line.quantity)
        throw new InsufficientStockError(line.variantId, level.available);
      level.reserved += line.quantity;
      if (level.available <= lowStockThreshold) {
        level.record(
          new StockLow({
            variantId: level.variantId,
            locationId: level.locationId,
            available: level.available,
          }),
        );
      }
    }
  }

  /**
   * Units free to sell per variant at the default location (`onHand - reserved`); a variant with no
   * row is absent from the map.
   */
  async available(variantIds: readonly string[]): Promise<Map<string, number>> {
    if (variantIds.length === 0) return new Map();
    const rows = await this.levels.find({ variantId: { $in: [...variantIds] } });
    return new Map(rows.map((level) => [level.variantId, level.available]));
  }

  /** Compensation of `reserve`. Idempotent: releasing twice never makes reserved stock negative. */
  async release(lines: readonly StockLine[]): Promise<void> {
    for (const line of lines) {
      const level = await this.levels.findOneOrFail({ variantId: line.variantId });
      level.reserved = Math.max(0, level.reserved - line.quantity);
    }
  }
}
