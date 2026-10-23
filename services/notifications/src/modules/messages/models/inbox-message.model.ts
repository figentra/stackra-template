/**
 * Stackra file contract:
 * Purpose: one in-app inbox entry for one principal: what happened, its data, and when it was read.
 * Boundary: data and its index. Key `messages.inbox_message`, table `messages.inbox_messages`,
 *           public ids `inm_…`; tenant-owned (BelongsToTenant). The recipient is a principal's
 *           public id. Written only by inbox listeners and read through
 *           `messages.inbox_message.list@1`; the notifications service is the inbox's one home
 *           (ADR 0223). An entry is stored, a notification is sent, and a model never takes a kind
 *           base's name, so this is InboxMessage and not `Notification`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 11, 20, 26 and 27), ADR 0239, ADR 0223
 */
import type { PublicId } from "@stackra/contracts";
import { Index, Model } from "@stackra/model";
import { BelongsToTenant, HasPublicId, Timestamps } from "@stackra/model/traits";
import { Field } from "@stackra/validation";
import { z } from "zod";
import type { InboxMessageKind } from "#modules/messages/enums/inbox-message-kind.enum";

/** Newest first per principal (`idx_inbox_messages_tenant_id_principal_id_created_at`). */
@Index(["tenantId", "principalId", "createdAt"])
export class InboxMessage extends Model.with(HasPublicId("inm"), BelongsToTenant, Timestamps) {
  /** Who sees the entry. */
  principalId!: PublicId<"usr">;

  /** What the entry is about; the client renders the kind's label with `data`. */
  kind!: InboxMessageKind;

  /** The values the label interpolates (ids, amounts); never free text from another tenant. */
  // reason: label values are ids or amounts, and a map of a scalar union has no field type
  @Field(z.record(z.string(), z.union([z.string(), z.number()])))
  data!: Record<string, string | number>;

  /** When the principal opened it; null while unread. */
  readAt: Date | null = null;
}
