/**
 * Stackra file contract:
 * Purpose: a sink fake that records calls and can be told to fail, for testing that a read survives
 *          a sink outage.
 * Boundary: built on the `Fake` base of @stackra/testing over the abstract port.
 * Runtime: isomorphic
 * Governing contract: ADR 0266 decision 2, ADR 0269
 */
import { AppError, ErrorCategory } from "@stackra/errors";
import { Fake } from "@stackra/testing";
import { AccessLogSink } from "#contracts/access-log-sink.port";
import type { AccessRecord } from "#core/interfaces/access-record.interface";

/** `FakeAccessLogSink.with({ failing: true })` throws on every write; the service must swallow it. */
export class FakeAccessLogSink extends Fake.of(AccessLogSink) {
  constructor(private readonly failing = false) {
    super();
  }

  /** Shorthand constructor for `.override(AccessLogSink, FakeAccessLogSink.with())`. */
  static with(options: { readonly failing?: boolean } = {}): FakeAccessLogSink {
    return new FakeAccessLogSink(options.failing ?? false);
  }

  /** Recorded; throws a typed `Unavailable` refusal when constructed as failing. */
  async write(record: AccessRecord): Promise<void> {
    this.record("write", record);
    if (this.failing)
      throw new AppError({
        category: ErrorCategory.Unavailable,
        code: "sink_down",
        retryable: true,
      });
  }
}
