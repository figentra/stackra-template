/**
 * Stackra file contract:
 * Purpose: proves the one earn path: the first earn enrolls the member, the tier multiplier
 *          applies, the credit is idempotent per reference and `points.earned` is recorded; a
 *          frozen account is refused.
 * Boundary: unit tier with the memory drivers, the demo seed and the members fake from the kit's
 *           own ./testing entry; the recorded events are asserted with `toEmit` from
 *           @stackra/events/testing.
 * Runtime: node
 * Governing contract: ADR 0105 (as amended), ADR 0141, ADR 0294 (decision 16), ADR 0022
 */
import { memberId } from "@acme/loyalty-kit";
import { LoyaltyMembers, LoyaltyTier } from "@acme/loyalty-kit/contracts";
import { LoyaltyKitModule, PointsEarned } from "@acme/loyalty-kit/node";
import { FakeLoyaltyMembers, LoyaltyKitDemoSeeder } from "@acme/loyalty-kit/testing";
import { createTestingModule } from "@stackra/container/testing";
import { refusal } from "@stackra/errors/testing";
import { beforeEach, describe, expect, freezeClock, it } from "@stackra/testing";
import { Refusals } from "#stackra/manifest";
import { AccountService } from "#node/services/account.service";

/** One purchase of 100.00, idempotent on its order reference. */
const purchase = { amountMinor: 10_000, currency: "SAR", reference: "ord_1" };

/**
 * Guards the only code that credits points, because a second path would skip the tier multiplier
 * and the event.
 */
describe(AccountService, () => {
  let accounts: AccountService;

  beforeEach(async () => {
    freezeClock("2026-10-21T00:00:00Z");
    const app = await createTestingModule(LoyaltyKitModule)
      .useDrivers("memory")
      .seed(LoyaltyKitDemoSeeder)
      .override(LoyaltyMembers, FakeLoyaltyMembers.with([]))
      .compile();
    accounts = app.get(AccountService);
  });

  /**
   * A paid order must earn even when the customer has never been enrolled, or the first purchase is
   * lost.
   */
  it("enrolls on the first earn and records points.earned once per reference", async () => {
    const member = memberId("usr_new");

    expect(await accounts.earn(member, purchase)).toBe(100);
    expect(await accounts.earn(member, purchase)).toBe(0); // same reference: nothing written

    expect((await accounts.findOneOrFail({ memberId: member })).tier).toBe(LoyaltyTier.Bronze);
    expect(accounts).toEmit(PointsEarned, { memberId: member, points: 100, balanceAfter: 100 });
  });

  /**
   * The gold member of the demo seed earns double, which proves the extension chain runs on this path.
   */
  it("applies the tier multiplier", async () => {
    expect(await accounts.earn(memberId(LoyaltyKitDemoSeeder.ids.gold), purchase)).toBe(200);
  });

  /**
   * A frozen account must refuse before anything is appended, or a review would be bypassed by a
   * purchase.
   */
  it("refuses an earn on a frozen account", async () => {
    const account = await accounts.findOneOrFail({ memberId: LoyaltyKitDemoSeeder.ids.silver });
    await accounts.setFrozen(account, true, new Date());

    await expect(
      accounts.earn(memberId(LoyaltyKitDemoSeeder.ids.silver), purchase),
    ).rejects.toRefuseWith(refusal(Refusals.loyalty_kit.account_frozen));
  });
});
