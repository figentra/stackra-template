/**
 * Stackra file contract:
 * Purpose: one fact: server state on the client: the persisted query cache and the offline mutation
 *          queue (ADR 0252).
 * Boundary: which actions may queue is the generated offline map (`#stackra/offline`); storage
 *           drivers per target are picked by gen. This file sets scope, age, encryption, replay and
 *           the cross-tab leader. Field names are the one set @stackra/query defines, so the
 *           console and mobile files read alike.
 * Runtime: isomorphic
 * Governing contract: ADR 0079, ADR 0252, ADR 0256
 */
import { Config, DriverOf } from "@stackra/config";
import type { DriverName } from "@stackra/container";
import { QueryScope } from "@stackra/query";
import { QueueLeader } from "@stackra/query/contracts";
import { Bool, Int, OneOf } from "@stackra/validation";

/** Server state on the client: the persisted query cache and the offline mutation queue. */
@Config("console.query")
export class QueryConfig {
  /**
   * Key cache and queue by tenant so a switch never shows another tenant's data.
   * @defaultValue QueryScope.Tenant
   */
  @OneOf(QueryScope) scope = QueryScope.Tenant;
  /** Encrypt the persisted cache at rest. @defaultValue true */
  @Bool() persistEncrypted = true;
  /** How long a persisted query may be shown before it must refetch. @defaultValue 24 */
  @Int({ min: 1 }) persistMaxAgeHours = 24;
  /** Drain the queue as soon as the network returns, without a click. @defaultValue true */
  @Bool() replayOnReconnect = true;
  /**
   * One tab drains the queue; the leader is elected through this driver.
   * @defaultValue "broadcast_channel"
   */
  @DriverOf(QueueLeader) queueLeader: DriverName<QueueLeader> = "broadcast_channel";
  /** Aggregates replayed in parallel; each aggregate stays FIFO. @defaultValue 4 */
  @Int({ min: 1 }) maxParallelAggregates = 4;
  /** Older entries surface as conflicts, never silently dropped. @defaultValue 7 */
  @Int({ min: 1 }) queueRetentionDays = 7;
  /** Seconds a fetched query counts as fresh. @defaultValue 30 */
  @Int({ min: 0 }) staleTimeSeconds = 30;
  /** Refetch stale queries when the window regains focus. @defaultValue true */
  @Bool() refetchOnFocus = true;
  /** Retries of a failed read before the error state shows. @defaultValue 2 */
  @Int({ min: 0 }) retry = 2;
}
