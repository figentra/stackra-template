/**
 * Stackra file contract:
 * Purpose: `inventory.stock.list_low@1`: stock levels at or below the tenant's low-stock threshold.
 * Boundary: read only. The permission is derived (`StockPermissions.read`, L1, because levels are
 *           internal): an MCP tool and an app-area endpoint for users who may read stock. The
 *           console's low-stock widget calls it over HTTP. The threshold is read from settings at
 *           call time, never baked in. The path is kept as `GET /stock/low` instead of the derived
 *           one.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 2, 16 and 21), ADR 0098, ADR 0155
 */
import { Query, type QueryContext } from "@stackra/actions";
import { ActorKind, HttpMethod } from "@stackra/contracts";
import type { SettingsReader } from "@stackra/settings";
import { Int, Schema } from "@stackra/validation";
import { InventorySettings } from "#modules/inventory/inventory.settings";
import type { LowStockItem } from "#modules/inventory/schemas/low-stock-item.schema";
import type { StockService } from "#modules/inventory/services/stock.service";

/** How many levels to return, lowest stock first. */
export class ListLowStockInput extends Schema {
  /** Levels per call; the widget asks for 5. */
  @Int({
    min: 1,
    max: 100,
  })
  limit = 20;
}

/** The levels, lowest stock first. */
export class ListLowStockOutput extends Schema {
  /** Every level at or below the threshold, up to `limit`. */
  items!: LowStockItem[];
}

/** The query behind the low-stock widget. */
export class ListLowStockQuery extends Query({
  key: "stock.list_low",
  actors: [ActorKind.User, ActorKind.Agent],
  endpoint: {
    method: HttpMethod.Get,
    path: "/stock/low",
  },
}) {
  /** @param settings - the tenant's threshold, resolved per call. */
  constructor(
    private readonly stock: StockService,
    private readonly settings: SettingsReader,
  ) {
    super();
  }

  /** Reads the tenant's threshold, then the levels at or below it, lowest first. */
  async handle(input: ListLowStockInput, _ctx: QueryContext): Promise<ListLowStockOutput> {
    const { lowStockThreshold } = await this.settings.for(InventorySettings);
    const levels = await this.stock.findAtOrBelow(lowStockThreshold, input.limit);
    return ListLowStockOutput.create({
      items: levels.map((level) => ({
        variantId: level.variantId,
        locationId: level.locationId,
        available: level.available,
      })),
    });
  }
}
