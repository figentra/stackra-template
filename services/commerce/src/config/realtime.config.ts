/**
 * Stackra file contract:
 * Purpose: this service's host layer over @stackra/realtime's defaults: who may subscribe to the
 *          channels its events broadcast on (`tenant.{tenantId}.orders`, `.inventory`).
 * Boundary: only what differs from the package. Each event's `broadcast.permission` still gates its
 *           own channel; this layer narrows subscription to staff sessions and shortens the
 *           subscribe token, because commerce's channels carry revenue and stock levels.
 * Runtime: node
 * Governing contract: ADR 0146, ADR 0225 (broadcast); ADR 0127 (realtime chain)
 */
import { override } from "@stackra/config";
import { Realm } from "@stackra/contracts";
import { RealtimeConfig } from "@stackra/realtime";

/** Customers never subscribe to tenant channels; a staff token lasts five minutes. */
export default override(RealtimeConfig, {
  channelRealms: [Realm.TenantAdmin],
  subscribeTokenTtl: "5m",
});
