/**
 * Stackra file contract:
 * Purpose: `inventory.stock.adjust@1`: set on-hand units after a count or a delivery.
 * Boundary: inline, one aggregate, one transaction (ADR 0101 d2). Sets, never increments, so a
 *           repeated PUT is harmless. The key's verb is not a permission verb, so the permission is
 *           named (`StockPermissions.manage`, L2) and StockPolicy#manage refines it through
 *           `ctx.authorize(level)`. The path is kept as
 *           `PUT /stock/:variantId/locations/:locationId` instead of the derived one. The reason
 *           goes to the action's audit record, never to the row.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 2, 3, 16 and 21), ADR 0098, ADR 0136
 */
import { Action, type ActionContext } from "@stackra/actions";
import { ActorKind, HttpMethod } from "@stackra/contracts";
import { StockPermissions } from "#modules/inventory/access/stock.permissions";
import type { AdjustStockInput } from "#modules/inventory/schemas/adjust-stock-input.schema";
import { AdjustStockOutput } from "#modules/inventory/schemas/adjust-stock-output.schema";
import type { StockService } from "#modules/inventory/services/stock.service";

/** Creates the level on first contact with a variant and location. */
export class AdjustStockAction extends Action({
  key: "stock.adjust",
  permission: StockPermissions.manage,
  actors: [ActorKind.User, ActorKind.Service],
  endpoint: {
    method: HttpMethod.Put,
    path: "/stock/:variantId/locations/:locationId",
  },
}) {
  /**
   * @param stock - the level reads and writes.
   */
  constructor(private readonly stock: StockService) {
    super();
  }

  /**
   * Reservations are left untouched: a count below reserved makes `available` negative, which the
   * low-stock widget surfaces.
   * @throws Refusal `forbidden` when StockPolicy#manage denies a customer.
   */
  async handle(input: AdjustStockInput, ctx: ActionContext): Promise<AdjustStockOutput> {
    const { variantId, locationId } = input;
    const level =
      (await this.stock.findOne({ variantId, locationId })) ??
      this.stock.create({ variantId, locationId });
    await ctx.authorize(level);
    level.onHand = input.onHand;
    ctx.audit({ reason: input.reason });
    return AdjustStockOutput.create({
      variantId: level.variantId,
      onHand: level.onHand,
      available: level.available,
    });
  }
}
