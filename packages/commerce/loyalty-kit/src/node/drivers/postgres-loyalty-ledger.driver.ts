/**
 * Stackra file contract:
 * Purpose: the default LoyaltyLedger driver: points entries kept in `@stackra/ledger`'s journal
 *          over Postgres.
 * Boundary: implements the port only and registers itself as `postgres`; lazy-loaded so it never
 *           reaches a browser bundle. The journal owns the arithmetic every ledger shares
 *           (idempotent append per reference, running balance, set-based reversal); the kit keeps
 *           its own domain port, so a host can still `@Replaces` it. Runs inside whatever
 *           transaction the caller holds. No SQL is written here.
 * Runtime: node
 * Governing contract: ADR 0263 (self-registering drivers), ADR 0220 (integer minor units), ADR 0266
 */
import { Driver } from "@stackra/container";
import type { Journal } from "@stackra/ledger";
import { LoyaltyLedger } from "#contracts/loyalty-ledger.port";
import { EXPIRE_REFERENCE_PREFIX } from "#core/constants/expire-reference-prefix.constant";
import { EntryKind } from "#core/enums/entry-kind.enum";
import type { PointsEntry } from "#core/interfaces/points-entry.interface";
import type { MemberId } from "#core/types/member-id.type";
import type { LedgerEntry } from "#node/models/ledger-entry.model";

/**
 * The journal's unique (tenant, account, reference) index, not application logic, enforces
 * idempotency.
 */
@Driver(LoyaltyLedger, "postgres")
export class PostgresLoyaltyLedger extends LoyaltyLedger {
  /**
   * @param journal - the journal over the `loyalty_ledger_entries` table, tenant-scoped by the
   * model's trait.
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
