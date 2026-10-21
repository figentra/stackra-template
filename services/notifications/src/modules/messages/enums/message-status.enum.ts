/**
 * Stackra file contract:
 * Purpose: where a message is in its short life.
 * Boundary: a house enum (class); no state family because the only move is queued → sent, done by
 *           MessageService.
 * Runtime: isomorphic
 * Governing contract: ADR 0128 (amended), guides/programming-model.mdx#enums
 */
import { Tone } from "@stackra/contracts";
import { Enum } from "@stackra/schema";
import { I18n } from "#stackra/i18n";

/** Lifecycle status of a message. */
export class MessageStatus extends Enum<MessageStatus> {
  /** Row created, transport not yet accepted it. */
  static readonly Queued = MessageStatus.case("queued", {
    label: I18n.messages.status.queued,
    color: Tone.Warning,
  });
  /** The transport accepted it. */
  static readonly Sent = MessageStatus.case("sent", {
    label: I18n.messages.status.sent,
    color: Tone.Success,
  });
  /** Retries exhausted; the delivery job sits in the dead-letter queue until redriven. */
  static readonly Failed = MessageStatus.case("failed", {
    label: I18n.messages.status.failed,
    color: Tone.Danger,
  });
}
