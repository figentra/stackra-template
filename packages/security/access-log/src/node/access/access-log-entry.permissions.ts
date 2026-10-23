/**
 * Stackra file contract:
 * Purpose: the permissions of the access log entry model: who may read the audit trail and who may
 *          purge it.
 * Boundary: statics only; the value is the risk and nothing else. Names are derived:
 *           `access_log.access_log_entry.<verb>`, and labels are the derived i18n keys
 *           `access_log::permissions.access_log_entry.<verb>`. `purge` is used only by the job, so
 *           it is a system permission no role may grant.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 16 and 20), ADR 0132 (permissions), ADR 0208 (names),
 *                     ADR 0134 (classification)
 */
import { Permission, Permissions } from "@stackra/iam";

/** Referenced as `AccessLogEntryPermissions.purge` by the retention job. */
export class AccessLogEntryPermissions extends Permissions {
  /** Read the audit trail; the records name who read what, so this is not for every staff role. */
  static readonly read = Permission.L1;

  /** Delete records older than the retention window; held only by the system actor. */
  static readonly purge = Permission.L2.system();
}
