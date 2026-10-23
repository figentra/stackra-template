/**
 * Stackra file contract:
 * Purpose: an in-memory sink for tests and `sink: "memory"`; keeps records in call order,
 *          deduplicated by callId.
 * Boundary: the memory driver that ships before the production driver (ADR 0266). Its name is the
 *           file prefix (`memory`); gen writes it as a candidate of the port into
 *           `#stackra/wiring`. Isomorphic, so it lives in core and ships from the `.` entry.
 *           `Driver(AccessLogSink)` takes the port as a value because the driver inherits its
 *           abstract members; the call returns the class, so there is no `defineDriver`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 15 and 16), ADR 0266 decision 2
 */
import { Driver } from "@stackra/container";
import { AccessLogSink } from "#contracts/ports/access-log-sink.port";
import type { AccessRecord } from "#contracts/types/access-record.type";

/**
 * Records live for the container's life; `records()` is what the `toHaveLoggedAccess` matcher
 * reads.
 */
export class MemoryAccessLogSinkDriver extends Driver(AccessLogSink) {
  /** Keyed by callId, so an at-least-once redelivery stores one row. */
  private readonly byCallId = new Map<string, AccessRecord>();

  /** Stores the record; a repeated callId is ignored. */
  async write(record: AccessRecord): Promise<void> {
    if (!this.byCallId.has(record.callId)) this.byCallId.set(record.callId, record);
  }

  /** Every stored record in write order. */
  records(): readonly AccessRecord[] {
    return [...this.byCallId.values()];
  }
}
