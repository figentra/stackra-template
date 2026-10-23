/**
 * Stackra file contract:
 * Purpose: this service's override of @stackra/realtime's configuration: who may subscribe to the
 *          channels its events broadcast on (`tenant.{tenantId}.orders`, `.inventory`).
 * Boundary: an override keeps its base's name and imports the base as `BaseRealtimeConfig`; it
 *           declares `override` members only (no `schema` or `env` of its own). Each event still
 *           declares the permission its broadcast needs; this layer narrows subscription to the
 *           tenant's staff and shortens the subscribe token, because commerce's channels carry
 *           revenue and stock levels. A field typed by an enum restates its type.
 * Runtime: node
 * Governing contract: ADR 0294 (decision 19, as amended by programming model v3.1, AGENTS.md),
 *                     ADR 0146, ADR 0225 (broadcast), ADR 0098 (realms)
 */
import { Duration, Realm } from "@stackra/contracts";
import { RealtimeConfig as BaseRealtimeConfig } from "@stackra/realtime";

/** Customers never subscribe to tenant channels; a staff token lasts five minutes. */
export class RealtimeConfig extends BaseRealtimeConfig {
  /** Only the tenant's staff may subscribe. */
  override channelRealms: Realm[] = [Realm.Tenant];

  /** How long a subscribe token stays valid. */
  override subscribeTokenTtl = Duration.minutes(5);
}
