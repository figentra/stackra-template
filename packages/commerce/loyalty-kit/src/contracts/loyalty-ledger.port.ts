/**
 * Stackra file contract:
 * Purpose: the LoyaltyLedger port: where points live. The kit drives it; drivers implement it.
 * Boundary: an abstract class that is its own DI token (ADR 0263): no `defineToken`, no same-named
 *           pair. Drivers `extends` it and register with `@Driver(LoyaltyLedger, name)`; config
 *           `ledger` picks one by name; a host swaps in its own class with
 *           `@Replaces(LoyaltyLedger)`.
 * Runtime: isomorphic
 * Governing contract: ADR 0263 (ports resolve by type), ADR 0117 (ports in ./contracts)
 */
import type { PointsEntry } from "#core/interfaces/points-entry.interface";
import type { MemberId } from "#core/types/member-id.type";

/** Where points live. The kit never knows which driver it got. */
export abstract class LoyaltyLedger {
  /** Sum of every live entry for the member; zero for an unknown member. */
  abstract balance(memberId: MemberId): Promise<number>;
  /**
   * Appends once per (memberId, reference).
   * @returns true when the entry was written; false, changing nothing, when that reference was
   * already applied.
   */
  abstract append(entry: PointsEntry): Promise<boolean>;
  /**
   * Marks every `earn` entry older than `before` as expired and returns the points removed.
   * @param before - entries whose `at` is strictly before this instant expire; the caller computes
   * it from settings.
   */
  abstract expire(memberId: MemberId, before: Date): Promise<number>;
}
