/**
 * Stackra file contract:
 * Purpose: `PostgresAuditTrailDriver`, this service's `AuditTrail`: every action call (a success, a refusal or a
 *          failure) becomes the next entry of its tenant's tamper-evident audit chain in `access_log.audit_log_entries`,
 *          which `access_log.audit_log_entry.search@1` reads and `access_log.audit_log_entry.export@1` ships to a SIEM.
 * Boundary: the `postgres` driver of `@stackra/access-log`, bound by `@Replaces(AuditTrail)` because two packages offer
 *           a driver and no config field selects one; it adds no behaviour. Without it the pipeline finds no trail and
 *           writes are not audited. The constructor restates the parent's so gen reads each injected token from the
 *           entry that exports it (`AuditLogEntry` is `@stackra/access-log/node`'s; gen resolved the inherited
 *           parameter to the root entry, which has none). A host that runs a separate audit service removes this file
 *           and binds that service's driver the same way. Its own module (`compliance`), so renaming or deleting the
 *           notes module keeps the service audited.
 * Runtime: node
 * Governing contract: ADR 0136 (decision 5); ADR 0212 (decisions 1, 3 and 4); ADR 0465 (decision 4); ADR 0294
 *                     (decisions 15 and 16: `@Replaces`); ADR 0263.
 */
import {
  type AuditLogEntry,
  PostgresAuditTrailDriver as AccessLogAuditTrailDriver,
} from "@stackra/access-log/node";
import { AuditTrail } from "@stackra/actions/contracts";
import { Replaces } from "@stackra/container";
import type { Logger } from "@stackra/contracts";
import type { Repository } from "@stackra/database";
import type { TenantIsolationService } from "@stackra/tenancy/node";

/** The service's write audit, stored per tenant in Postgres. */
@Replaces(AuditTrail)
export class PostgresAuditTrailDriver extends AccessLogAuditTrailDriver {
  /**
   * @param entries - the write audit table, tenant-scoped by its policy.
   * @param tenancy - tenant isolation, for the tenant setting of each write.
   * @param logger - where an entry of a call in no tenant is reported.
   */
  // oxlint-disable-next-line no-useless-constructor -- restated for gen's token resolution (Boundary); the parent works
  constructor(entries: Repository<AuditLogEntry>, tenancy: TenantIsolationService, logger: Logger) {
    super(entries, tenancy, logger);
  }
}
