/**
 * Stackra file contract:
 * Purpose: stock reservation for orders and availability for the storefront, plus the low-stock
 *          read. Orders calls `reserve` as a workflow step with `release` as its undo.
 * Boundary: exported to sibling modules (orders reserves, catalogue reads `available`); runs inside
 *           the caller's transaction and never calls the network. `CrudService<StockLevel>`
 *           supplies the inherited reads and writes (`find`, `findOne`, `findOneOrFail`, `create`).
 *           The advisory lock is an explicit call on the injected `Locks` port. `stock.low` is
 *           recorded on the aggregate and reaches the outbox when the unit of work flushes. The
 *           low-stock scan subtracts in SQL through the `sql` tag, the one sanctioned raw escape
 *           (ADR 0160), with column names from the generated table constants.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 16 and 17), ADR 0149 (locking), ADR 0101 (workflow
 *                     steps call module services), ADR 0141, ADR 0160 (raw SQL)
 */
import { Duration, type PublicId, SortDirection } from "@stackra/contracts";
import { CrudService, sql } from "@stackra/database";
import type { Locks } from "@stackra/locking";
import type { SettingsReader } from "@stackra/settings";
import { StockLevels } from "#stackra/tables";
import { InsufficientStockError } from "#modules/inventory/errors/insufficient-stock.error";
import { StockLow } from "#modules/inventory/events/stock-low.event";
import { InventorySettings } from "#modules/inventory/inventory.settings";
import { StockLevel } from "#modules/inventory/models/stock-level.model";
import type { StockLine } from "#modules/inventory/types/stock-line.type";

/**
 * Reservations are the module's only write path besides the adjust action. `reserve` and `release`
 * are a pair: whoever reserves owns the matching release (orders does it through the workflow's
 * undo step and through cancel).
 */
export class StockService extends CrudService<StockLevel> {
  /**
   * @param settings - the threshold and the backorder policy, read per call for the tenant.
   * @param locks - the advisory locks `reserve` holds per variant.
   */
  constructor(
    private readonly settings: SettingsReader,
    private readonly locks: Locks,
  ) {
    super();
  }

  /**
   * Reserves every line or none, at the default location, under one advisory lock per variant
   * (the lock driver sorts the keys, so two overlapping orders never deadlock) held for at most
   * five seconds. Records `stock.low` on each level that reaches the threshold.
   * @throws InsufficientStockError naming the first variant that cannot be covered.
   */
  reserve(lines: readonly StockLine[]): Promise<void> {
    const keys = lines.map((line) => StockLevel.lockKey(line.variantId));
    return this.locks.with(keys, Duration.seconds(5), async () => {
      const { lowStockThreshold, allowBackorders } = await this.settings.get(InventorySettings);
      for (const line of lines) {
        const level = await this.findOneOrFail({ variantId: line.variantId });
        if (!allowBackorders && level.available < line.quantity) {
          throw InsufficientStockError.create({
            variantId: line.variantId,
            available: level.available,
          });
        }
        level.reserved += line.quantity;
        if (level.available <= lowStockThreshold) {
          level.record(
            StockLow.create({
              variantId: level.variantId,
              locationId: level.locationId,
              available: level.available,
            }),
          );
        }
      }
    });
  }

  /** Undo of `reserve`. Idempotent: releasing twice never makes reserved stock negative. */
  async release(lines: readonly StockLine[]): Promise<void> {
    for (const line of lines) {
      const level = await this.findOneOrFail({ variantId: line.variantId });
      level.reserved = Math.max(0, level.reserved - line.quantity);
    }
  }

  /**
   * Units free to sell per variant at the default location (`onHand - reserved`); a variant with
   * no row is absent from the map.
   */
  async available(variantIds: readonly PublicId<"var">[]): Promise<Map<PublicId<"var">, number>> {
    if (variantIds.length === 0) return new Map();
    const levels = await this.find({ variantId: { $in: [...variantIds] } });
    return new Map(levels.map((level) => [level.variantId, level.available]));
  }

  /** Levels whose on-hand minus reserved is at or below `threshold`, lowest on-hand first. */
  findAtOrBelow(threshold: number, limit: number): Promise<StockLevel[]> {
    return this.find(
      {
        $raw: sql`${StockLevels.columns.onHand} - ${StockLevels.columns.reserved} <= ${threshold}`,
      },
      { limit, orderBy: { onHand: SortDirection.Asc } },
    );
  }
}
