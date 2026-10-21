/**
 * Stackra file contract:
 * Purpose: an in-memory sink for tests and `sink: "memory"`; keeps records in call order,
 *          deduplicated by callId.
 * Boundary: the memory driver that ships before the production driver (ADR 0266); registers itself.
 * Runtime: isomorphic
 * Governing contract: ADR 0266 decision 2
 */
import { Driver } from "@stackra/container";
import { AccessLogSink } from "#contracts/access-log-sink.port";
import type { AccessRecord } from "#core/interfaces/access-record.interface";

/**
 * Records live for the container's life; `records()` is what the `toHaveLoggedAccess` matcher
 * reads.
 */
@Driver(AccessLogSink, "memory")
export class MemoryAccessLogSink extends AccessLogSink {
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
