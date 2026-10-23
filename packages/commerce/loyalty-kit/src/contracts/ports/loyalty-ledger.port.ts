/**
 * Stackra file contract:
 * Purpose: the LoyaltyLedger port: where points live. The kit drives it; drivers implement it.
 * Boundary: an abstract class that is its own token, key `loyalty_kit.LoyaltyLedger`. Drivers
 *           extend `Driver(LoyaltyLedger)` and are named by their file prefix (`memory`,
 *           `postgres`); config `ledger` picks one by name; a host swaps in its own class with
 *           `@Replaces(LoyaltyLedger)`. A leaf file: it imports nothing outside src/contracts.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 15, 16 and 17), ADR 0263 (ports resolve by type)
 */
import { Port } from "@stackra/container";
import type { MemberId } from "#contracts/types/member-id.type";
import type { PointsEntry } from "#contracts/types/points-entry.type";

/** Where points live. The kit never knows which driver it got. */
export abstract class LoyaltyLedger extends Port {
  /** Sum of every live entry for the member; zero for an unknown member. */
  abstract balance(memberId: MemberId): Promise<number>;

  /**
   * Appends once per (memberId, reference).
   * @returns true when the entry was written; false, changing nothing, when that reference was
   *          already applied.
   */
  abstract append(entry: PointsEntry): Promise<boolean>;

  /**
   * Marks every `earn` entry older than `before` as expired and returns the points removed.
   * @param before - entries whose `at` is strictly before this instant expire; the caller computes
   *                 it from settings.
   */
  abstract expire(memberId: MemberId, before: Date): Promise<number>;
}
