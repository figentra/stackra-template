/**
 * Stackra file contract:
 * Purpose: proves a frozen account denies every redeemer and a customer only sees their own
 *          account.
 * Boundary: unit tier; the policy comes from the testing module and is called directly with
 *           unsaved factory records (`make`); actors from @stackra/iam/testing.
 * Runtime: node
 * Governing contract: ADR 0132 d4, ADR 0294 (decision 16), ADR 0022
 */
import { LoyaltyMembers } from "@acme/loyalty-kit/contracts";
import { LoyaltyKitModule } from "@acme/loyalty-kit/node";
import { FakeLoyaltyMembers, LoyaltyAccountFactory } from "@acme/loyalty-kit/testing";
import { createTestingModule } from "@stackra/container/testing";
import { Decision } from "@stackra/iam";
import { actors } from "@stackra/iam/testing";
import { beforeEach, describe, expect, it } from "@stackra/testing";
import { LoyaltyAccountPolicy } from "#node/access/loyalty-account.policy";

/** Guards account authorization so one member can never read or redeem another's points. */
describe(LoyaltyAccountPolicy, () => {
  let policy: LoyaltyAccountPolicy;

  beforeEach(async () => {
    const app = await createTestingModule(LoyaltyKitModule)
      .useDrivers("memory")
      .override(LoyaltyMembers, FakeLoyaltyMembers.with([]))
      .compile();
    policy = app.get(LoyaltyAccountPolicy);
  });

  /**
   * Staff hold the permission, yet the record rule must still deny: a frozen account is frozen for
   * everyone.
   */
  it("denies redemption from a frozen account, whoever asks", () => {
    const frozen = LoyaltyAccountFactory.new().frozen().make();
    expect(policy.redeem(actors.staff(), frozen)).toBe(Decision.Deny);
  });

  /**
   * Abstain (not Allow) for the owner, so the permission stays the only grant; Deny for a stranger.
   */
  it("lets a customer act only on their own account", () => {
    const own = LoyaltyAccountFactory.new().make({ memberId: "usr_1" });
    expect(policy.read(actors.customer("usr_1"), own)).toBe(Decision.Abstain);
    expect(policy.read(actors.customer("usr_2"), own)).toBe(Decision.Deny);
  });
});
