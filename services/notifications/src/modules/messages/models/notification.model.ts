/**
 * Stackra file contract:
 * Purpose: one in-app inbox entry for one principal: what happened, its data, and when it was read.
 * Boundary: tenant-owned (BelongsToTenant: tenant column + RLS); the recipient is a principal id.
 *           Written only by inbox listeners; read through `messages.notification.list`. The
 *           notifications service is the inbox's one home (ADR 0223: no notifications package).
 * Runtime: node
 * Governing contract: ADR 0095, 0239, guides/programming-model.mdx#models; ADR 0127
 */
import { DateTime, Enumerated, Index, Json, Model, Nullable, Str } from "@stackra/model";
import { BelongsToTenant, HasPublicId, Timestamps } from "@stackra/model/traits";
import { NotificationKind } from "#modules/messages/enums/notification-kind.enum";

/** Key `messages.notification`, table `notifications`; public ids are `ntf_…`. */
@Model()
// → idx_notifications_tenant_id_principal_id_created_at
@Index(["tenantId", "principalId", "createdAt"])
export class Notification extends Model.with(HasPublicId("ntf"), BelongsToTenant, Timestamps) {
  /** Who sees the entry, by principal public id. */
  @Str({ max: 64 }) principalId!: string;
  /** What the entry is about; the client renders the kind's label with `data`. */
  @Enumerated(NotificationKind) kind!: NotificationKind;
  /** The values the label interpolates (ids, amounts); never free text from another tenant. */
  @Json() data!: Record<string, string | number>;
  /** When the principal opened it; null while unread. */
  @Nullable() @DateTime() readAt!: Date | null;
}
