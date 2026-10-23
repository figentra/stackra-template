/**
 * Stackra file contract:
 * Purpose: this app's override of @stackra/query's configuration: server state on the device, the
 *          persisted encrypted query cache and the offline mutation queue.
 * Boundary: an override declares `override` members only and inherits the base's key (`query`);
 *           its presence mounts the query context, so the app writes no query provider. Which
 *           actions may queue is the generated offline map (`#stackra/offline`), not a value here.
 *           Storage drivers come from the target (sqlite for `cache` and `outbox`, secure-store for
 *           the key). Encryption is not optional on a device (ADR 0059 decision 1), so there is no
 *           switch for it. A field typed by an enum restates its type.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 19), ADR 0295 (decision 10), ADR 0059, ADR 0079,
 *                     ADR 0252, ADR 0256
 */
import { QueryConfig, QueryScope } from "@stackra/query";

/** Keyed by tenant, so a switch never shows another tenant's data; replayed gently on a radio. */
export class MobileQueryConfig extends QueryConfig {
  /** What the cache and the queue are keyed by. */
  override scope: QueryScope = QueryScope.Tenant;

  /** Hours a persisted query survives a cold start. */
  override persistMaxAgeHours = 24;

  /** Replay the queue as soon as the network returns; off waits for the user's retry. */
  override replayOnReconnect = true;

  /** Aggregates replayed in parallel; low on a phone radio. */
  override maxParallelAggregates = 2;

  /** Days a queued call is kept; older entries surface as conflicts, never silently dropped. */
  override queueRetentionDays = 7;

  /** Seconds a query result counts as fresh. */
  override staleTimeSeconds = 30;

  /** Refetch stale queries when the app returns to the foreground. */
  override refetchOnFocus = true;

  /** Retries of a failed read before the error state shows. */
  override retry = 2;
}
