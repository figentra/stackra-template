/**
 * Stackra file contract:
 * Purpose: the default LoyaltyLedger driver: points entries kept in `@stackra/ledger`'s journal
 *          over Postgres.
 * Boundary: implements the port only. Its name is the file prefix (`postgres`), the package
 *           default in LoyaltyKitConfig; the generated wiring loads it lazily, so it never reaches
 *           a browser bundle. The journal owns the arithmetic every ledger shares (idempotent
 *           append per reference, running balance, set-based reversal); the kit keeps its own
 *           domain port, so a host can still `@Replaces` it. Runs inside whatever transaction the
 *           caller holds. A covered debit is the journal's floored append: one conditional update
 *           of the account's running-balance row (`SET balance = balance + :amount WHERE … AND
 *           balance + :amount >= :floor`), which takes that row's lock, so concurrent debits of one
 *           member serialise and zero updated rows means the balance did not cover it. No SQL is
 *           written here. `Driver(LoyaltyLedger)` takes the port as a
 *           value because the driver inherits its abstract members; the call returns the class,
 *           so there is no `defineDriver`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 15 and 16), ADR 0220 (integer minor units), ADR 0266
 */
import { Driver } from "@stackra/container";
import type { Journal } from "@stackra/ledger/node";
import { DebitOutcome } from "#contracts/enums/debit-outcome.enum";
import { EntryKind } from "#contracts/enums/entry-kind.enum";
import { LoyaltyLedger } from "#contracts/ports/loyalty-ledger.port";
import type { MemberId } from "#contracts/types/member-id.type";
import type { PointsEntry } from "#contracts/types/points-entry.type";
import { EXPIRE_REFERENCE_PREFIX } from "#core/constants/expire-reference-prefix.constant";
import type { LedgerEntry } from "#node/models/ledger-entry.model";

/**
 * The journal's unique (tenant, member, reference) index, not application logic, enforces
 * idempotency.
 */
export class PostgresLoyaltyLedgerDriver extends Driver(LoyaltyLedger) {
  /**
   * @param journal - the journal over `loyalty_kit.ledger_entries`, tenant-scoped by the model's
   *                  trait.
   */
  constructor(private readonly journal: Journal<LedgerEntry>) {
    super();
  }

  /** The journal's running balance of the member's account; zero when it has no entries. */
  async balance(memberId: MemberId): Promise<number> {
    return this.journal.balance({ account: memberId, amount: "points" });
  }

  /**
   * Appends the entry to the journal once per (member, reference) pair.
   * @returns false, changing nothing, when the journal already holds the pair.
   */
  async append(entry: PointsEntry): Promise<boolean> {
    const { written } = await this.journal.append({
      account: entry.memberId,
      amount: entry.points,
      kind: entry.kind,
      reference: entry.reference,
      at: entry.at,
    });
    return written;
  }

  /**
   * Appends the debit only while the running balance stays at or above zero, in the same statement
   * that locks the member's balance row.
   * @returns `uncovered` when the floor refused it, `duplicate` when the pair already exists.
   */
  async debit(entry: PointsEntry): Promise<DebitOutcome> {
    const { written, belowFloor } = await this.journal.append(
      {
        account: entry.memberId,
        amount: entry.points,
        kind: entry.kind,
        reference: entry.reference,
        at: entry.at,
      },
      { floor: 0 },
    );
    if (belowFloor) return DebitOutcome.Uncovered;
    return written ? DebitOutcome.Written : DebitOutcome.Duplicate;
  }

  /** The journal row under the (member, reference) pair, mapped back to the port's entry. */
  async find(memberId: MemberId, reference: string): Promise<PointsEntry | null> {
    const row = await this.journal.find({ account: memberId, reference });
    if (!row) return null;
    return {
      memberId,
      points: row.amount,
      kind: row.kind,
      reference: row.reference,
      at: row.at,
    };
  }

  /**
   * Reverses every stale earn in one journal call, so a crash mid-way leaves nothing half done.
   * Each reversal's reference is the earn's under {@link EXPIRE_REFERENCE_PREFIX}, which makes a
   * repeat reverse nothing more.
   */
  async expire(memberId: MemberId, before: Date): Promise<number> {
    const reversed = await this.journal.reverseWhere(
      { account: memberId, kind: EntryKind.Earn, before },
      { kind: EntryKind.Expire, referencePrefix: EXPIRE_REFERENCE_PREFIX, at: before },
    );
    return reversed.reduce((sum, entry) => sum + entry.amount, 0);
  }
}
