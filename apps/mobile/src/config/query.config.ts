/**
 * Stackra file contract:
 * Purpose: one fact: server state on the device: the persisted encrypted query cache and the
 *          offline mutation queue.
 * Boundary: which actions may queue is the generated offline map (`#stackra/offline`), not a value
 *           here. Storage drivers come from the target (sqlite for `cache` and `outbox`,
 *           secure-store for the key). Encryption is not optional on a device (ADR 0059 d1), so
 *           there is no switch for it. Field names are the one set of @stackra/query, shared with
 *           the console.
 * Runtime: isomorphic
 * Governing contract: ADR 0059, ADR 0079, ADR 0252, ADR 0256
 */
import { Config } from "@stackra/config";
import { QueryScope } from "@stackra/query";
import { Bool, Int, OneOf } from "@stackra/validation";

/**
 * `QueryScope.Tenant` keys the cache and the queue by tenant so a switch never shows another
 * tenant's data.
 */
@Config("mobile.query")
export class QueryConfig {
  /** What the cache and the queue are keyed by. @defaultValue QueryScope.Tenant */
  @OneOf(QueryScope) scope = QueryScope.Tenant;
  /** Hours a persisted query survives a cold start. @defaultValue 24 */
  @Int({ min: 1 }) persistMaxAgeHours = 24;
  /**
   * Replay the queue as soon as the network returns; off waits for the user's retry. @defaultValue
   * true
   */
  @Bool() replayOnReconnect = true;
  /** Aggregates replayed in parallel; low on a phone radio. @defaultValue 2 */
  @Int({ min: 1 }) maxParallelAggregates = 2;
  /**
   * Days a queued call is kept; older entries surface as conflicts, never silently dropped.
   * @defaultValue 7
   */
  @Int({ min: 1 }) queueRetentionDays = 7;
  /** Seconds a query result counts as fresh. @defaultValue 30 */
  @Int({ min: 0 }) staleTimeSeconds = 30;
  /** Refetch stale queries when the app returns to the foreground. @defaultValue true */
  @Bool() refetchOnFocus = true;
  /** Retries of a failed read before the error state shows. @defaultValue 2 */
  @Int({ min: 0 }) retry = 2;
}
