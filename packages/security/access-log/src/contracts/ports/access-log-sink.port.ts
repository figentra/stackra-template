/**
 * Stackra file contract:
 * Purpose: the AccessLogSink port: where access records go. A port is an interface the package
 *          codes against without knowing who implements it: AccessLogService writes to it, and a
 *          driver (memory, postgres, or a host's SIEM forwarder) implements it.
 * Boundary: an abstract class that is its own token, key `access_log.AccessLogSink`. Drivers
 *           extend `Driver(AccessLogSink)` and are named by their file prefix (`memory`,
 *           `postgres`); config `sink` picks one; a host's SIEM forwarder is a class marked
 *           `@Replaces(AccessLogSink)`. A leaf file: it imports nothing outside src/contracts.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 15, 16 and 17), ADR 0263
 */
import { Port } from "@stackra/contracts";
import type { AccessRecord } from "#contracts/types/access-record.type";

/**
 * Receives one record per logged call; must never throw into the caller (a sink failure is logged,
 * not raised).
 */
export abstract class AccessLogSink extends Port {
  /** Appends the record; at least once, so a sink must tolerate a repeat of the same `callId`. */
  abstract write(record: AccessRecord): Promise<void>;
}
