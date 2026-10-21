/**
 * Stackra file contract:
 * Purpose: one outbound message: who, which mail, the provider's id once sent. The dedup row for
 *          the command.
 * Boundary: tenant-owned (BelongsToTenant: tenant column + RLS); the recipient is a principal id,
 *           never an address, and the body is never stored (the subject is, for support).
 * Runtime: node
 * Governing contract: ADR 0095, 0134 (no address stored), 0239, guides/programming-model.mdx#models
 */
import { DateTime, Enumerated, Index, Model, Nullable, Str } from "@stackra/model";
import { BelongsToTenant, HasPublicId, Timestamps } from "@stackra/model/traits";
import { MessageStatus } from "#modules/messages/enums/message-status.enum";

/**
 * Key `messages.message`, table `messages`; public ids are `msg_…`; `commandKey` is the command's
 * idempotency key.
 */
@Model()
@Index(["tenantId", "commandKey"], { unique: true }) // → idx_messages_tenant_id_command_key
export class Message extends Model.with(HasPublicId("msg"), BelongsToTenant, Timestamps) {
  /** The producer's derived key; a redelivered command finds this row and sends nothing twice. */
  @Str({ max: 128 }) commandKey!: string;
  /**
   * Who receives it, by principal public id; the address is resolved from identity at send time.
   */
  @Str({ max: 64 }) principalId!: string;
  /** The `@Mail` key of the template the producer rendered (`order_placed`, `order_receipt`). */
  @Str({ max: 64 }) mail!: string;
  /** The rendered subject, kept for support. */
  @Str({ max: 200 }) subject!: string;
  /** Where the message is. */
  @Enumerated(MessageStatus) status!: MessageStatus;
  /** The transport's message id once accepted. */
  @Nullable() @Str({ max: 128 }) providerId!: string | null;
  /** When the transport accepted it. */
  @Nullable() @DateTime() sentAt!: Date | null;
}
