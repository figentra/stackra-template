/**
 * Stackra file contract:
 * Purpose: an in-memory LoyaltyLedger for tests and `ledger: "memory"`; the same idempotency,
 *          covered-debit and expiry contract as postgres.
 * Boundary: the memory driver every capability ships before its production driver (ADR 0266). Its
 *           name is the file prefix (`memory`); gen writes it as a candidate of the port into
 *           `#stackra/wiring`. Isomorphic, so it lives in core and ships from the `.` entry. The
 *           base is `Driver(LoyaltyLedger)`, a call that already returns a class, so it carries no
 *           `define` prefix (`define*` is kept for the four stackra.config.ts functions); the port
 *           is a value argument because the driver inherits its abstract members, which TypeScript
 *           then makes this class implement.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 15 and 16, as amended by programming model v3.1,
 *                     AGENTS.md), ADR 0266 decision 2
 */
import { Driver } from "@stackra/container";
import { DebitOutcome } from "#contracts/enums/debit-outcome.enum";
import { EntryKind } from "#contracts/enums/entry-kind.enum";
import { LoyaltyLedger } from "#contracts/ports/loyalty-ledger.port";
import type { MemberId } from "#contracts/types/member-id.type";
import type { PointsEntry } from "#contracts/types/points-entry.type";
import { EXPIRE_REFERENCE_PREFIX } from "#core/constants/expire-reference-prefix.constant";

/** Holds entries in a Map for the life of the container, so every test gets a fresh ledger. */
export class MemoryLoyaltyLedgerDriver extends Driver(LoyaltyLedger) {
  /** Entries keyed `<memberId>|<reference>`, which is what makes `append` idempotent. */
  private readonly entries = new Map<string, PointsEntry>();

  /** Sums every entry of the member on each call; fine for tests, not a production path. */
  async balance(memberId: MemberId): Promise<number> {
    return this.sumOf(memberId);
  }

  /**
   * Stores the entry once per (memberId, reference) pair.
   * @returns false and changes nothing when the pair was seen before.
   */
  async append(entry: PointsEntry): Promise<boolean> {
    const key = `${entry.memberId}|${entry.reference}`;
    if (this.entries.has(key)) return false;
    this.entries.set(key, entry);
    return true;
  }

  /**
   * Checks the balance and stores the entry with no `await` between them: one turn of the event
   * loop, so a concurrent debit of the same member always sees this one, as the postgres row lock
   * makes it there.
   */
  async debit(entry: PointsEntry): Promise<DebitOutcome> {
    const key = `${entry.memberId}|${entry.reference}`;
    if (this.entries.has(key)) return DebitOutcome.Duplicate;
    if (this.sumOf(entry.memberId) + entry.points < 0) return DebitOutcome.Uncovered;
    this.entries.set(key, entry);
    return DebitOutcome.Written;
  }

  /** The stored entry under the pair, or null. */
  async find(memberId: MemberId, reference: string): Promise<PointsEntry | null> {
    return this.entries.get(`${memberId}|${reference}`) ?? null;
  }

  /**
   * Writes one `Expire` entry per stale `Earn` entry; repeating it with the same `before` expires
   * nothing more.
   */
  async expire(memberId: MemberId, before: Date): Promise<number> {
    let removed = 0;
    // a snapshot: `append` adds entries to the map while this loop runs
    for (const e of Array.from(this.entries.values())) {
      if (e.memberId !== memberId || e.kind !== EntryKind.Earn || e.at >= before) continue;
      const written = await this.append({
        memberId,
        points: -e.points,
        kind: EntryKind.Expire,
        reference: `${EXPIRE_REFERENCE_PREFIX}${e.reference}`,
        at: before,
      });
      if (written) removed += e.points;
    }
    return removed;
  }

  /** The synchronous sum `balance` and `debit` share, so a debit checks without yielding. */
  private sumOf(memberId: MemberId): number {
    let sum = 0;
    for (const e of this.entries.values()) if (e.memberId === memberId) sum += e.points;
    return sum;
  }
}
