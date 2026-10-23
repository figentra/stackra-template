/**
 * Stackra file contract:
 * Purpose: a sink fake that records calls and can be told to fail, for testing that a read survives
 *          a sink outage.
 * Boundary: built on the `Fake` base of @stackra/testing over the abstract port. A failing write
 *           throws AccessLogWriteFailedError (kind `unavailable`), as a real sink does when its
 *           store is down; AccessLogService swallows it, so no caller is refused.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 15), ADR 0266 decision 2, ADR 0269
 */
import { Fake } from "@stackra/testing";
import { AccessLogSink } from "#contracts/ports/access-log-sink.port";
import type { AccessRecord } from "#contracts/types/access-record.type";
import { AccessLogWriteFailedError } from "#core/errors/access-log-write-failed.error";

/** `AccessLogSinkFake.with({ failing: true })` throws on every write; the service swallows it. */
export class AccessLogSinkFake extends Fake.of(AccessLogSink) {
  /** @param failing - when true, every write throws after it is recorded. */
  constructor(private readonly failing = false) {
    super();
  }

  /** Shorthand constructor for `.override(AccessLogSink, AccessLogSinkFake.with())`. */
  static with(options: { readonly failing?: boolean } = {}): AccessLogSinkFake {
    return new AccessLogSinkFake(options.failing ?? false);
  }

  /** Recorded; throws when constructed as failing. */
  async write(record: AccessRecord): Promise<void> {
    this.record("write", record);
    if (this.failing) throw AccessLogWriteFailedError.create();
  }
}
