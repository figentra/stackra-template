/**
 * Stackra file contract:
 * Purpose: one movement on a member's points balance, as the ledger port receives it (a DTO, not
 *          the persisted row).
 * Boundary: a plain interface; the row with its tenant and ids is `LedgerEntry` in ./node.
 * Runtime: isomorphic
 * Governing contract: ADR 0128 decision 4 (interfaces/ kind folder), ADR 0007 (TSDoc on every
 *                     property)
 */
import type { EntryKind } from "#core/enums/entry-kind.enum";
import type { MemberId } from "#core/types/member-id.type";

/** An append-only ledger movement; a balance is the sum of a member's live entries. */
export interface PointsEntry {
  /** Whose points move. */
  readonly memberId: MemberId;
  /**
   * Points moved: positive for `Earn` and positive `Adjust`, negative for `Redeem`, `Expire` and
   * negative `Adjust`. Whole points.
   */
  readonly points: number;
  /** Why the entry exists; decides which entries the expiry job may remove. */
  readonly kind: EntryKind;
  /**
   * What caused the entry (an order id, a campaign id); one entry per (memberId, reference) is the
   * idempotency rule.
   */
  readonly reference: string;
  /**
   * When the cause happened, from the caller's clock (the event time), not when the row was
   * written.
   */
  readonly at: Date;
}
