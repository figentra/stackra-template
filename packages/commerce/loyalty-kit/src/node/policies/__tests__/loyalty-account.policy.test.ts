/**
 * Stackra file contract:
 * Purpose: proves a frozen account denies every redeemer and a customer only sees their own
 *          account.
 * Boundary: unit tier; the policy is called directly with unsaved factory records; actors from
 *           @stackra/iam/testing.
 * Runtime: node
 * Governing contract: ADR 0132 decision 4, ADR 0022, ADR 0007 (amended: test docblocks)
 */
import { describe, expect, it } from "@stackra/testing";
import { Decision } from "@stackra/iam";
import { actors } from "@stackra/iam/testing";
import { fakeEntityManager } from "@stackra/database/testing";
import { LoyaltyAccountFactory } from "@acme/loyalty-kit/testing";
import { LoyaltyAccountPolicy } from "#node/policies/loyalty-account.policy";

const policy = new LoyaltyAccountPolicy(); // no dependencies: no container needed
const accounts = new LoyaltyAccountFactory(fakeEntityManager());

/** Guards account authorization so one member can never read or redeem another's points. */
describe(LoyaltyAccountPolicy, () => {
  /**
   * Staff hold the permission, yet the record rule must still deny: a frozen account is frozen for
   * everyone.
   */
  it("denies redemption from a frozen account, whoever asks", () => {
    expect(policy.redeem(actors.staff("usr_staff"), accounts.state("frozen").makeOne())).toBe(
      Decision.Deny,
    );
  });

  /**
   * Abstain (not Allow) for the owner, so the permission stays the only grant; Deny for a stranger.
   */
  it("lets a customer act only on their own account", () => {
    const own = accounts.makeOne({ memberId: "usr_1" });
    expect(policy.read(actors.customer("usr_1"), own)).toBe(Decision.Abstain);
    expect(policy.read(actors.customer("usr_2"), own)).toBe(Decision.Deny);
  });
});
