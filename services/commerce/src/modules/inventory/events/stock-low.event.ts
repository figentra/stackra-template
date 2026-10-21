/**
 * Stackra file contract:
 * Purpose: available units at a location fell to or below the tenant's threshold.
 * Boundary: a private event (`DomainEvent`): other services learn stock through queries, not
 *           events. `broadcast` pushes it to every console session of the tenant holding stock
 *           read, so the low-stock tile updates live.
 * Runtime: isomorphic
 * Governing contract: ADR 0141, ADR 0225 (realtime), guides/programming-model.mdx#events
 */
import { DomainEvent, Event, z } from "@stackra/events";
import { StockPermissions } from "#modules/inventory/permissions/stock.permission";

/** Recorded on the StockLevel by `StockService.reserve`. */
@Event({
  name: "stock.low",
  broadcast: {
    channel: (e) => `tenant.${e.meta.tenantId}.inventory`,
    permission: StockPermissions.read,
  },
})
export class StockLow extends DomainEvent(
  z.object({ variantId: z.string(), locationId: z.string(), available: z.number().int() }),
) {}
