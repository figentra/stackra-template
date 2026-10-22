/**
 * Stackra file contract:
 * Purpose: `expect(ledger).toHaveBalance(member, points)`: a domain matcher over the LoyaltyLedger
 *          port.
 * Boundary: a matcher owned by the package whose port it reads (ADR 0269), exported from
 *           `@acme/loyalty-kit/testing`.
 * Runtime: isomorphic
 * Governing contract: ADR 0269 (domain matchers live in the owning package's ./testing)
 */
import { createMatcher } from "@stackra/testing";
import type { LoyaltyLedger } from "#contracts/loyalty-ledger.port";
import type { MemberId } from "#core/types/member-id.type";

/**
 * Passes when the ledger's balance for `member` equals `points`; the message names both numbers.
 */
export const toHaveBalance = createMatcher(
  "toHaveBalance",
  async (ledger: LoyaltyLedger, member: MemberId, points: number) => {
    const actual = await ledger.balance(member);
    return {
      pass: actual === points,
      message: () => `expected ${member} to have ${points} points, found ${actual}`,
    };
  },
);

declare module "@stackra/testing" {
  interface Matchers<R> {
    /** Asserts the ledger balance of one member. */
    toHaveBalance(member: MemberId, points: number): Promise<R>;
  }
}
