/**
 * Stackra file contract:
 * Purpose: the AccessLogSink port: where access records go. The Explorer's interceptor writes to
 *          it; drivers implement it.
 * Boundary: an abstract class that is its own DI token (ADR 0263). Drivers `extends` it and
 *           register with `@Driver(AccessLogSink, name)`; config `sink` picks one; a host's SIEM
 *           forwarder is `@Replaces(AccessLogSink)`.
 * Runtime: isomorphic
 * Governing contract: ADR 0263, ADR 0117 (ports in ./contracts)
 */
import type { AccessRecord } from "#core/interfaces/access-record.interface";

/**
 * Receives one record per logged call; must never throw into the caller (a sink failure is logged,
 * not raised).
 */
export abstract class AccessLogSink {
  /** Appends the record; at least once, so a sink must tolerate a repeat of the same `callId`. */
  abstract write(record: AccessRecord): Promise<void>;
}
