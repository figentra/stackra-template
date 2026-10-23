/**
 * Stackra file contract:
 * Purpose: the first table of the access-log package, `access_log.access_log_entries`, with every
 *          column and `@Index` the model declared at the time.
 * Boundary: written by `stackra db diff` from `access_log.access_log_entry`, reviewed, then
 *           committed and never edited. It changes only the package's own Postgres schema
 *           (`access_log`); the table constant carries the qualified name, and gen creates the
 *           schema before the first migration. `t.tenant()` adds the row-level security policy.
 *           Forward only: there is no `down()`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13 and 20), ADR 0159 (as amended), ADR 0239, ADR 0231
 *                     (index and key names)
 */
import { type Blueprint, Migration } from "@stackra/database";
import { AccessLogEntries } from "#stackra/tables";
import { DataClassification } from "#contracts/enums/data-classification.enum";

/** One table; the unique (tenant, callId) index is what makes the sink idempotent. */
export class CreateAccessLogEntriesMigration extends Migration {
  /** Creates the table with its RLS policy, its time index and its idempotency index. */
  up(schema: Blueprint): void {
    schema.create(AccessLogEntries, (t) => {
      t.publicId("acl");
      t.tenant();
      t.string(AccessLogEntries.columns.callId, 64);
      t.string(AccessLogEntries.columns.target, 200);
      t.enum(AccessLogEntries.columns.classification, DataClassification); // ck_ on the codes
      t.jsonb(AccessLogEntries.columns.actor);
      t.jsonb(AccessLogEntries.columns.subjects);
      t.timestamp(AccessLogEntries.columns.at).index(); // idx_access_log_entries_at
      // idx_access_log_entries_tenant_id_call_id, unique
      t.unique([AccessLogEntries.columns.tenantId, AccessLogEntries.columns.callId]);
    });
  }
}
