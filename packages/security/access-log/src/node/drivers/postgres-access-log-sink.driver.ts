/**
 * Stackra file contract:
 * Purpose: the production sink: one row per record; a repeated callId is swallowed by the unique
 *          index.
 * Boundary: implements the port only; registers itself as `postgres` and is lazy-loaded by the
 *           generated wiring. Drivers always sit in `drivers/`, even when ./node has only one.
 * Runtime: node
 * Governing contract: ADR 0263 (self-registering drivers)
 */
import { Driver } from "@stackra/container";
import { Repository, UniqueViolation } from "@stackra/database";
import { AccessLogSink } from "#contracts/access-log-sink.port";
import type { AccessRecord } from "#core/interfaces/access-record.interface";
import { AccessLogEntry } from "#node/models/access-log-entry.model";

/**
 * Writes outside the caller's transaction (`requiresNew`), so a rolled-back read still leaves its
 * access record.
 */
@Driver(AccessLogSink, "postgres")
export class PostgresAccessLogSink extends AccessLogSink {
  constructor(private readonly rows: Repository<AccessLogEntry>) {
    super();
  }

  /**
   * Inserts in its own transaction; a UniqueViolation on callId means the record is already there.
   */
  async write(record: AccessRecord): Promise<void> {
    try {
      await this.rows.insert(
        { ...record, actor: { ...record.actor }, subjects: [...record.subjects] },
        { requiresNew: true },
      );
    } catch (error) {
      if (!(error instanceof UniqueViolation)) throw error;
    }
  }
}
