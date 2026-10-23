/**
 * Stackra file contract:
 * Purpose: the permissions of the inbox entry model: `messages.notification.<verb>`, each with its
 *          risk.
 * Boundary: statics only; the value is the risk and nothing else. Every principal reads and updates
 *           only their own entries: the list query and the mark-read action narrow by the actor in
 *           the lookup itself, so there is no policy. Labels are the derived i18n keys
 *           `messages::permissions.notification.<verb>`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 16 and 20), ADR 0132, ADR 0208 (names), ADR 0099 (risk)
 */
import { Permission, Permissions } from "@stackra/iam";

/** `read` is also the permission a session needs to receive the inbox refresh broadcast. */
export class NotificationPermissions extends Permissions {
  /** Read one's own inbox. */
  static readonly read = Permission.L0;

  /** Change one's own entries (mark read). */
  static readonly update = Permission.L0;
}
