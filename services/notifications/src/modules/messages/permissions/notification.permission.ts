/**
 * Stackra file contract:
 * Purpose: the permissions of the `notification` resource; names are
 *          `messages.notification.<member>`.
 * Boundary: a decorated class of constants; risk lives here only (ADR 0132). Every principal reads
 *           and updates only their own entries: the list query and the mark-read action narrow by
 *           the actor, not by a policy.
 * Runtime: isomorphic
 * Governing contract: ADR 0132, ADR 0208, guides/programming-model.mdx#permissions
 */
import { Permission, Permissions, Risk } from "@stackra/iam";
import { Notification } from "#modules/messages/models/notification.model";

/** Labels default to `messages::permissions.notification.<verb>`. */
@Permissions(Notification)
export class NotificationPermissions {
  /** Read one's own inbox. */
  @Permission({ risk: Risk.L0 }) static readonly read: Permission;
  /** Change one's own entries (mark read); the action narrows to the actor's entries. */
  @Permission({ risk: Risk.L0 }) static readonly update: Permission;
}
