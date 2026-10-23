/**
 * Stackra file contract:
 * Purpose: builds a record from a call and hands it to the sink; swallows sink failures so a read
 *          never fails because the log is down (the failure is reported through the logger
 *          instead).
 * Boundary: the only writer of the sink; exported by the module. It resolves the subjects from the
 *           facet's options: the principal the call is for, or the named field of every record
 *           among the call's arguments and result. A call that touched no subject writes nothing.
 *           Logger and Clock are ports of @stackra/contracts, injected by type.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 6 and 16), ADR 0134 (classification), ADR 0184
 *                     (telemetry)
 */
import { Service } from "@stackra/app";
import type { Actor, Clock, Logger } from "@stackra/contracts";
import type { AccessLogSink } from "#contracts/ports/access-log-sink.port";
import type { AccessLoggedOptions } from "#contracts/types/access-logged-options.type";
import { ACCESS_LOG_WRITE_FAILED } from "#core/constants/access-log-write-failed.constant";

/** Called by AccessLogExplorer around every declared method of an `@AccessLogged` class. */
export class AccessLogService extends Service {
  /**
   * @param sink - the configured sink driver, by type.
   * @param logger - where a swallowed sink failure is reported.
   * @param clock - the pipeline clock, so a test can pin a record's `at`.
   */
  constructor(
    private readonly sink: AccessLogSink,
    private readonly logger: Logger,
    private readonly clock: Clock,
  ) {
    super();
  }

  /**
   * Writes one record. Never throws: a sink error is logged as {@link ACCESS_LOG_WRITE_FAILED} with
   * the callId so an operator can replay it.
   * @param callId - unique per call; the sink's idempotency key.
   * @param actor - the full actor with its `onBehalfOf` chain.
   * @param target - `<Class>.<method>` that was called.
   * @param options - the class's `@AccessLogged` options.
   * @param values - the call's arguments, then its result when it returned one.
   */
  async record(
    callId: string,
    actor: Actor,
    target: string,
    options: AccessLoggedOptions,
    values: readonly unknown[],
  ): Promise<void> {
    const subjects = this.subjectsOf(options, actor, values);
    if (subjects.length === 0) return; // the call exposed nobody's data
    try {
      await this.sink.write({
        callId,
        actor,
        target,
        classification: options.classification,
        subjects,
        at: this.clock.now(),
      });
    } catch (cause) {
      this.logger.error(ACCESS_LOG_WRITE_FAILED, { callId, target, cause });
    }
  }

  /**
   * The principal the call is for when the facet names no field; otherwise the distinct string
   * values of that field on every record among the values, arrays opened one level.
   */
  private subjectsOf(
    options: AccessLoggedOptions,
    actor: Actor,
    values: readonly unknown[],
  ): string[] {
    const field = options.subjects;
    if (!field) return [(actor.onBehalfOf ?? actor).id];
    const found = new Set<string>();
    for (const value of values.flatMap((item) => (Array.isArray(item) ? item : [item]))) {
      if (typeof value !== "object" || value === null) continue;
      const id: unknown = (value as Record<string, unknown>)[field];
      if (typeof id === "string") found.add(id);
    }
    return [...found];
  }
}
