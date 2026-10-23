/**
 * Stackra file contract:
 * Purpose: the in-app inbox table of the messages module, `messages.notifications`.
 * Boundary: written by `stackra db diff` from `messages.notification`, reviewed, then committed and
 *           never edited. It changes only the module's own Postgres schema (`messages`). The
 *           recipient is a principal's public id in `varchar(30)`. Forward only.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 20 and 27), ADR 0159 (as amended), ADR 0231
 *                     (index and key names)
 */
import { type Blueprint, Migration } from "@stackra/database";
import { Notifications } from "#stackra/tables";
import { NotificationKind } from "#modules/messages/enums/notification-kind.enum";

/** The per-principal, newest-first index is the one the inbox query reads. */
export class CreateNotificationsMigration extends Migration {
  /** Creates the table and its index. */
  up(schema: Blueprint): void {
    schema.create(Notifications, (t) => {
      t.publicId("ntf");
      t.tenant();
      t.timestamps();
      t.string(Notifications.columns.principalId, 30); // PublicId<"usr">
      t.enum(Notifications.columns.kind, NotificationKind); // text with ck_notifications_kind
      t.jsonb(Notifications.columns.data);
      t.timestamp(Notifications.columns.readAt).nullable();
      // idx_notifications_tenant_id_principal_id_created_at
      t.index([
        Notifications.columns.tenantId,
        Notifications.columns.principalId,
        Notifications.columns.createdAt,
      ]);
    });
  }
}
