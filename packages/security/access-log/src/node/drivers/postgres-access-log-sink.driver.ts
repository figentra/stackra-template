/**
 * Stackra file contract:
 * Purpose: the production sink: one row per record; a repeated callId is swallowed by the unique
 *          index.
 * Boundary: implements the port only. Its name is the file prefix (`postgres`), the package
 *           default in AccessLogConfig; the generated wiring loads it lazily, so it never reaches a
 *           browser bundle.
 *           `Driver(AccessLogSink)` takes the port as a value because the driver inherits its
 *           abstract members; the call returns the class, so there is no `defineDriver`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 15 and 16), ADR 0263
 */
import { Driver } from "@stackra/container";
import { type Repository, UniqueViolation } from "@stackra/database";
import { AccessLogSink } from "#contracts/ports/access-log-sink.port";
import type { AccessRecord } from "#contracts/types/access-record.type";
import type { AccessLogEntry } from "#node/models/access-log-entry.model";

/**
 * Writes outside the caller's transaction (`requiresNew`), so a rolled-back read still leaves its
 * access record.
 */
export class PostgresAccessLogSinkDriver extends Driver(AccessLogSink) {
  /** @param rows - the record repository, tenant-scoped by the model's trait. */
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
