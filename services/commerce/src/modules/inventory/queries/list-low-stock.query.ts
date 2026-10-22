/**
 * Stackra file contract:
 * Purpose: `inventory.stock.list_low`: variants at or below the tenant's low-stock threshold.
 * Boundary: read only; L1 (stock levels are internal): an MCP tool and an app-area endpoint for
 *           users who may read stock (the console's low-stock widget calls it over HTTP).
 * Runtime: node
 * Governing contract: ADR 0098, 0155, guides/programming-model.mdx#queries
 */
import { AsEndpoint, Query, type QueryContext } from "@stackra/actions";
import type { SettingsReader } from "@stackra/settings";
import type { StockLevelRepository } from "#modules/inventory/repositories/stock-level.repository";
import { StockPermissions } from "#modules/inventory/permissions/stock.permission";
import { InventorySettings } from "#modules/inventory/settings/inventory.setting";
import { LowStockInput } from "#modules/inventory/schemas/low-stock-input.schema";
import { LowStockOutput } from "#modules/inventory/schemas/low-stock-output.schema";
import { ActorKind, HttpMethod } from "@stackra/contracts";

/**
 * The query behind the low-stock widget; the threshold is read from settings at call time, not
 * baked in.
 */
@Query({
  key: "stock.list_low",
  input: LowStockInput,
  output: LowStockOutput,
  permission: StockPermissions.read,
  actors: [ActorKind.User, ActorKind.Agent],
})
@AsEndpoint({ method: HttpMethod.Get, path: "/stock/low" })
export class ListLowStockQuery {
  constructor(
    private readonly levels: StockLevelRepository,
    private readonly settings: SettingsReader,
  ) {}

  /** Reads the tenant's threshold, then the rows at or below it, lowest first. */
  async handle(input: LowStockInput, _ctx: QueryContext): Promise<LowStockOutput> {
    const { lowStockThreshold } = await this.settings.for(InventorySettings);
    const rows = await this.levels.findAtOrBelow(lowStockThreshold, input.limit);
    return {
      items: rows.map((r) => ({
        variantId: r.variantId,
        locationId: r.locationId,
        available: r.available,
      })),
    };
  }
}
