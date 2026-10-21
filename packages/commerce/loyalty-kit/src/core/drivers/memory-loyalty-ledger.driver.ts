/**
 * Stackra file contract:
 * Purpose: an in-memory LoyaltyLedger for tests and `ledger: "memory"`; same idempotency and expiry
 *          contract as postgres.
 * Boundary: the memory driver every capability ships before its production driver (ADR 0266).
 *           Registers itself with `@Driver(LoyaltyLedger, "memory")`; gen writes the binding into
 *           `#stackra/wiring`. Isomorphic, so it lives in core and ./testing re-exports it.
 * Runtime: isomorphic
 * Governing contract: ADR 0266 decision 2
 */
import { Driver } from "@stackra/container";
import { LoyaltyLedger } from "#contracts/loyalty-ledger.port";
import { EXPIRE_REFERENCE_PREFIX } from "#core/constants/expire-reference-prefix.constant";
import { EntryKind } from "#core/enums/entry-kind.enum";
import type { PointsEntry } from "#core/interfaces/points-entry.interface";
import type { MemberId } from "#core/types/member-id.type";

/** Holds entries in a Map for the life of the container, so every test gets a fresh ledger. */
@Driver(LoyaltyLedger, "memory")
export class MemoryLoyaltyLedger extends LoyaltyLedger {
  /** Entries keyed `<memberId>|<reference>`, which is what makes `append` idempotent. */
  private readonly entries = new Map<string, PointsEntry>();

  /** Sums every entry of the member on each call; fine for tests, not a production path. */
  async balance(memberId: MemberId): Promise<number> {
    let sum = 0;
    for (const e of this.entries.values()) if (e.memberId === memberId) sum += e.points;
    return sum;
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
   * Writes one `Expire` entry per stale `Earn` entry; repeating it with the same `before` expires
   * nothing more.
   */
  async expire(memberId: MemberId, before: Date): Promise<number> {
    let removed = 0;
    for (const e of [...this.entries.values()]) {
      if (e.memberId !== memberId || !e.kind.is(EntryKind.Earn) || e.at >= before) continue;
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
}
