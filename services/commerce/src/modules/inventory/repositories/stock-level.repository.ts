/**
 * Stackra file contract:
 * Purpose: named reads over stock levels: the low-stock scan on the computed `available` column.
 * Boundary: reads only. The subtraction runs in SQL through the `sql` tag, the one sanctioned raw
 *           escape (ADR 0160); column names come from the generated table constants.
 * Runtime: node
 * Governing contract: ADR 0130 (amended: repositories for query classes), ADR 0160 (raw SQL), v2
 *                     guides/programming-model.mdx#repositories
 */
import { Repository, RepositoryOf, sql } from "@stackra/database";
import { StockLevels } from "#stackra/tables";
import { StockLevel } from "#modules/inventory/models/stock-level.model";

/** Injected as `Repository<StockLevel>` or as `StockLevelRepository`. */
@RepositoryOf(StockLevel)
export class StockLevelRepository extends Repository<StockLevel> {
  /** Rows whose on-hand minus reserved is at or below `threshold`, lowest first. */
  findAtOrBelow(threshold: number, limit: number): Promise<StockLevel[]> {
    return this.find(
      {
        $raw: sql`${StockLevels.columns.onHand} - ${StockLevels.columns.reserved} <= ${threshold}`,
      },
      { limit, orderBy: { onHand: "asc" } },
    );
  }
}
