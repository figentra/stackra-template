/**
 * Stackra file contract:
 * Purpose: the fact that available units at a location fell to or below the tenant's threshold.
 *          Leaves through the outbox as `inventory.stock.low.v1`.
 * Boundary: an integration event recorded by StockService#reserve only. It is an integration event
 *           because only those may broadcast: the broadcast declares `inventory.stock.read` as the
 *           permission a session needs to receive the data-free refresh on
 *           `tenant.{tenantId}.inventory`, so the console's low-stock widget updates without
 *           polling; @stackra/realtime enforces it at delivery. The audience is the tenant (the
 *           default is the principal): stock is about a variant, never about one person. Version 1
 *           until a breaking change.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 5, 16 and 20), ADR 0141, ADR 0078, ADR 0225 (broadcast)
 */
import type { PublicId } from "@stackra/contracts";
import { BroadcastAudience, IntegrationEvent } from "@stackra/events";
import { Int, Str } from "@stackra/validation";
import { StockPermissions } from "#modules/inventory/access/stock.permissions";

/** Recorded on the StockLevel when a reservation crosses the threshold. */
export class StockLow extends IntegrationEvent({
  name: "stock.low",
  broadcast: {
    permission: StockPermissions.read,
    audience: BroadcastAudience.Tenant,
  },
}) {
  /** The variant running low. */
  variantId!: PublicId<"var">;

  /** The location the count is for. */
  @Str({ max: 64 })
  locationId!: string;

  /** Units still sellable after the reservation. */
  @Int
  available!: number;
}
