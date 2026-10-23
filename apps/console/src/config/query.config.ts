/**
 * Stackra file contract:
 * Purpose: the console's override of @stackra/query's configuration: server state on the client,
 *          the persisted query cache and the offline mutation queue (ADR 0252).
 * Boundary: an override declares `override` members only and inherits the base's key (`query`).
 *           The query context `createApp` mounts reads it, scoped to the active tenant so a switch
 *           never shows another tenant's cache. Which actions may queue is the generated offline
 *           map (`#stackra/offline`); storage drivers per target are picked by gen, and the
 *           persister is the encrypted IndexedDB one on every target (on desktop its key is held by
 *           Electron `safeStorage`, desktop.config.ts `offlineStore`).
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 19), ADR 0295 (decision 10), ADR 0079, ADR 0252, ADR 0256
 */
import type { DriverName } from "@stackra/container";
import { QueryConfig, QueryScope } from "@stackra/query";
import type { QueueLeader } from "@stackra/query/contracts";

/** Server state on the client: the persisted query cache and the offline mutation queue. */
export class ConsoleQueryConfig extends QueryConfig {
  /** Key cache and queue by tenant so a switch never shows another tenant's data. */
  override scope: QueryScope = QueryScope.Tenant;

  /** Encrypt the persisted cache at rest. */
  override persistEncrypted = true;

  /** Hours a persisted query may be shown before it must refetch. */
  override persistMaxAgeHours = 24;

  /** Drain the queue as soon as the network returns, without a click. */
  override replayOnReconnect = true;

  /** One tab drains the queue; the leader is elected through this driver. */
  override queueLeader: DriverName<QueueLeader> = "broadcast_channel";

  /** Aggregates replayed in parallel; each aggregate stays FIFO. */
  override maxParallelAggregates = 4;

  /** Days after which older entries surface as conflicts, never silently dropped. */
  override queueRetentionDays = 7;

  /** Seconds a fetched query counts as fresh. */
  override staleTimeSeconds = 30;

  /** Refetch stale queries when the window regains focus. */
  override refetchOnFocus = true;

  /** Retries of a failed read before the error state shows. */
  override retry = 2;
}
