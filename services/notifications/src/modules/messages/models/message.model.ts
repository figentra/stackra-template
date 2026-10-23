/**
 * Stackra file contract:
 * Purpose: one outbound message: who, which template, the provider's id once sent. The dedup row of
 *          the queued call that asked for it.
 * Boundary: data and its index. Key `messages.message`, table `messages.messages` (the module's
 *           Postgres schema), public ids `msg_…`; tenant-owned (BelongsToTenant: a tenant column
 *           and RLS). The recipient is a principal's public id, never an address, and the body is
 *           never stored, only the subject, for support (ADR 0134). Written only by MessageService.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 11, 20 and 27), ADR 0134 (no address stored),
 *                     ADR 0239 (BelongsToTenant)
 */
import type { PublicId } from "@stackra/contracts";
import { Index, Model } from "@stackra/model";
import { BelongsToTenant, HasPublicId, Timestamps } from "@stackra/model/traits";
import { Str } from "@stackra/validation";
import { MessageStatus } from "#modules/messages/enums/message-status.enum";

/** `commandKey` is the queued call's idempotency key, unique per tenant. */
@Index(["tenantId", "commandKey"], { unique: true })
export class Message extends Model.with(HasPublicId("msg"), BelongsToTenant, Timestamps) {
  /** The producer's derived key; a redelivered call finds this row and sends nothing twice. */
  @Str({ max: 128 })
  commandKey!: string;

  /** Who receives it; the address is resolved from identity at send time, never stored. */
  principalId!: PublicId<"usr">;

  /** The producer's template key (`order_placed`, `order_receipt`). */
  @Str({ max: 64 })
  mail!: string;

  /** The rendered subject, kept for support. */
  @Str({ max: 200 })
  subject!: string;

  /** Where the message is; the initializer is the state of a new row. */
  status: MessageStatus = MessageStatus.Queued;

  /** The transport's message id once it accepted the message. */
  @Str({ max: 128 })
  providerId: string | null = null;

  /** When the transport accepted it. */
  sentAt: Date | null = null;
}
