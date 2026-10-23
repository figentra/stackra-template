/**
 * Stackra file contract:
 * Purpose: one in-app inbox entry for one principal: what happened, its data, and when it was read.
 * Boundary: data and its index. Key `messages.notification`, table `messages.notifications`, public
 *           ids `ntf_…`; tenant-owned (BelongsToTenant). The recipient is a principal's public id.
 *           Written only by inbox listeners and read through `messages.notification.list@1`; the
 *           notifications service is the inbox's one home (ADR 0223). A model, not the
 *           `Notification` kind of @stackra/notifications: an entry is stored, a notification is
 *           sent.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 11, 20, 26 and 27), ADR 0239, ADR 0223
 */
import type { PublicId } from "@stackra/contracts";
import { Index, Model } from "@stackra/model";
import { BelongsToTenant, HasPublicId, Timestamps } from "@stackra/model/traits";
import { Field } from "@stackra/validation";
import { z } from "zod";
import type { NotificationKind } from "#modules/messages/enums/notification-kind.enum";

/** Newest first per principal (`idx_notifications_tenant_id_principal_id_created_at`). */
@Index(["tenantId", "principalId", "createdAt"])
export class Notification extends Model.with(HasPublicId("ntf"), BelongsToTenant, Timestamps) {
  /** Who sees the entry. */
  principalId!: PublicId<"usr">;

  /** What the entry is about; the client renders the kind's label with `data`. */
  kind!: NotificationKind;

  /** The values the label interpolates (ids, amounts); never free text from another tenant. */
  // reason: label values are ids or amounts, and a map of a scalar union has no field type
  @Field(z.record(z.string(), z.union([z.string(), z.number()])))
  data!: Record<string, string | number>;

  /** When the principal opened it; null while unread. */
  readAt: Date | null = null;
}
