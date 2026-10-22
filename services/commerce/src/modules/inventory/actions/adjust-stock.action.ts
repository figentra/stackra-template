/**
 * Stackra file contract:
 * Purpose: `inventory.stock.adjust`: set on-hand units after a count or a delivery.
 * Boundary: inline, one aggregate, one transaction (ADR 0101 d2). Sets, never increments, so a
 *           repeated PUT is harmless.
 * Runtime: node
 * Governing contract: ADR 0098, 0136, guides/programming-model.mdx#actions
 */
import { Action, AsEndpoint, type ActionContext } from "@stackra/actions";
import type { Repository } from "@stackra/database";
import type { StockLevel } from "#modules/inventory/models/stock-level.model";
import { StockPermissions } from "#modules/inventory/permissions/stock.permission";
import { AdjustStockInput } from "#modules/inventory/schemas/adjust-stock-input.schema";
import { AdjustStockOutput } from "#modules/inventory/schemas/adjust-stock-output.schema";
import { ActorKind, HttpMethod } from "@stackra/contracts";

/** Creates the row on first contact with a variant and location. */
@Action({
  key: "stock.adjust",
  input: AdjustStockInput,
  output: AdjustStockOutput,
  permission: StockPermissions.manage,
  actors: [ActorKind.User, ActorKind.Service],
})
@AsEndpoint({ method: HttpMethod.Put, path: "/stock/:variantId/locations/:locationId" })
export class AdjustStockAction {
  constructor(private readonly levels: Repository<StockLevel>) {}

  /**
   * Reservations are left untouched: a count below reserved makes `available` negative, which the
   * widget surfaces.
   */
  async handle(input: AdjustStockInput, ctx: ActionContext): Promise<AdjustStockOutput> {
    const level =
      (await this.levels.findOne({ variantId: input.variantId, locationId: input.locationId })) ??
      this.levels.create({
        variantId: input.variantId,
        locationId: input.locationId,
        onHand: 0,
        reserved: 0,
      });
    await ctx.authorize(StockPermissions.manage, level);
    level.onHand = input.onHand;
    // the reason goes to the action's audit record, not the row
    ctx.audit({ reason: input.reason });
    return { variantId: level.variantId, onHand: level.onHand, available: level.available };
  }
}
