/**
 * Stackra file contract:
 * Purpose: builds a record from a call and hands it to the sink; swallows sink failures so a read
 *          never fails because the log is down (the failure is reported through the logger
 *          instead).
 * Boundary: the only writer of the sink; exported by the module. Logger and Clock are
 *           abstract-class ports of @stackra/contracts, injected by type.
 * Runtime: isomorphic
 * Governing contract: ADR 0184 (telemetry), ADR 0263 (ports resolve by type)
 */
import { Clock, Logger, type Actor } from "@stackra/contracts";
import { AccessLogSink } from "#contracts/access-log-sink.port";
import { ACCESS_LOG_WRITE_FAILED } from "#core/constants/access-log-write-failed.constant";
import type { AccessLoggedOptions } from "#core/interfaces/access-logged-options.interface";

/** Called by the Explorer's interceptor around every decorated method. */
export class AccessLogService {
  /**
   * @param sink - the configured sink driver, by type.
   * @param logger - where a swallowed sink failure is reported.
   * @param clock - the pipeline clock, so a test can pin a record's `at`.
   */
  constructor(
    private readonly sink: AccessLogSink,
    private readonly logger: Logger,
    private readonly clock: Clock,
  ) {}

  /**
   * Writes one record. Never throws: a sink error is logged as {@link ACCESS_LOG_WRITE_FAILED} with
   * the callId so an operator can replay it.
   * @param callId - unique per call; the sink's idempotency key.
   * @param actor - the full actor with its `onBehalfOf` chain.
   * @param target - `<Class>.<method>` that was called.
   * @param options - the method's `@AccessLogged` options.
   * @param args - the decorated method's arguments, handed to `options.subjects`.
   */
  async record(
    callId: string,
    actor: Actor,
    target: string,
    options: AccessLoggedOptions<never[]>,
    args: readonly unknown[],
  ): Promise<void> {
    try {
      await this.sink.write({
        callId,
        actor,
        target,
        classification: options.classification,
        // the decorator's own type tied them to this method
        subjects: options.subjects(...(args as never[])),
        at: this.clock.now(),
      });
    } catch (cause) {
      this.logger.error(ACCESS_LOG_WRITE_FAILED, { callId, target, cause });
    }
  }
}
