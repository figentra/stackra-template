/**
 * Stackra file contract:
 * Purpose: the permissions of the `access_log_entry` resource: who may read the audit trail and who
 *          may purge it.
 * Boundary: a decorated class of constants; names are `access_log.access_log_entry.<member>`. Risk
 *           lives here, on the permission. `purge` is used only by the job, so gen makes it
 *           ungrantable to a role.
 * Runtime: node
 * Governing contract: ADR 0132 (permissions), ADR 0208 (names), ADR 0134 (classification)
 */
import { Permission, Permissions, Risk } from "@stackra/iam";
import { AccessLogEntry } from "#node/models/access-log-entry.model";

/**
 * Referenced as `AccessLogEntryPermissions.read` by the resource and `.purge` by the retention job.
 */
@Permissions(AccessLogEntry)
export class AccessLogEntryPermissions {
  /** Read the audit trail; the records name who read what, so this is not for every staff role. */
  @Permission({ risk: Risk.L1 }) static readonly read: Permission;
  /** Delete records older than the retention window; only the purge job runs it. */
  @Permission({ risk: Risk.L2 }) static readonly purge: Permission;
}
