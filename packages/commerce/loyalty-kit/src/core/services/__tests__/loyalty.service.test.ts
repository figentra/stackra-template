/**
 * Stackra file contract:
 * Purpose: proves redemption is capped by balance and by maxRedeemPercent, that the base earn is
 *          pure maths, that a non-member or an overdrawn member is refused, that two concurrent
 *          holds of the whole balance write one and refuse the other with no overdraft, and that
 *          settle and release give held points back exactly once in either order.
 * Boundary: unit tier with the memory driver and the members fake from the kit's own ./testing
 *           entry. Helpers come from the packages that own them: vitest and the clock from
 *           @stackra/testing, the module builder from @stackra/container/testing, the refusal
 *           matcher from @stackra/errors/testing.
 * Runtime: node
 * Governing contract: ADR 0294 (decision 15), ADR 0143, ADR 0022 (tests beside the subject)
 */
import {
  InsufficientPointsError,
  LoyaltyKitConfig,
  LoyaltyService,
  memberId,
  NotAMemberError,
} from "@acme/loyalty-kit";
import { LoyaltyLedger, LoyaltyMembers } from "@acme/loyalty-kit/contracts";
import { LoyaltyKitModule } from "@acme/loyalty-kit/node";
import { LoyaltyMembersFake, pointsEntry } from "@acme/loyalty-kit/testing";
import { createTestingModule } from "@stackra/container/testing";
import { refusal } from "@stackra/errors/testing";
import { beforeEach, describe, expect, freezeClock, it } from "@stackra/testing";

/** The one enrolled member of these cases. */
const usr1 = memberId("usr_1");

/** The frozen clock, also the time of every seeded entry. */
const at = new Date("2026-10-21T00:00:00Z");

/**
 * The arithmetic of the kit; the ledger is the memory driver chosen by config, exactly as a host
 * would choose it.
 */
describe(LoyaltyService, () => {
  let loyalty: LoyaltyService;
  let ledger: LoyaltyLedger;

  beforeEach(async () => {
    freezeClock(at.toISOString());
    const mod = await createTestingModule(LoyaltyKitModule)
      .withConfig(LoyaltyKitConfig, {
        ledger: "memory",
        pointValueMinor: 1,
        earnPerMinor: 0.1,
        maxRedeemPercent: 30,
      })
      .override(LoyaltyMembers, LoyaltyMembersFake.with(["usr_1"]))
      .compile();
    loyalty = mod.get(LoyaltyService);
    ledger = mod.get(LoyaltyLedger);
  });

  /**
   * The base rate is floored and ledger-free: an extension or a tier may scale it later, but it is never
   * written here.
   */
  it("quotes the base earn without touching the ledger", async () => {
    expect(loyalty.quoteEarn(5_000)).toBe(500);
    expect(loyalty.quoteEarn(9)).toBe(0);
    expect(await ledger.balance(usr1)).toBe(0);
  });

  /** 30 % of 1 000 minor is 300; the balance (10 000) and the request (9 999) are both above it. */
  it("caps redemption at maxRedeemPercent of the total", async () => {
    await ledger.append(pointsEntry.build({ memberId: usr1, points: 10_000, at }));
    expect(await loyalty.quote(usr1, 9_999, 1_000)).toEqual({ points: 300, amountMinor: 300 });
  });

  /**
   * Both refusals are typed errors, so the pipeline maps them to the right status without a handler
   * branch.
   */
  it("refuses a redemption above the balance, and any redemption by a non-member", async () => {
    await ledger.append(pointsEntry.build({ memberId: usr1, points: 100, at })); // 100 points
    await expect(loyalty.assertCanRedeem(usr1, 101)).rejects.toRefuseWith(
      refusal(InsufficientPointsError),
    );
    await expect(loyalty.assertCanRedeem(memberId("usr_2"), 1)).rejects.toRefuseWith(
      refusal(NotAMemberError),
    );
  });

  /**
   * The race the memory driver must mirror from postgres: both holds start before either finishes,
   * the first is written, the second sees it and is refused, and the balance stops at zero.
   */
  it("holds one of two concurrent redemptions of the balance, refusing the other", async () => {
    await ledger.append(pointsEntry.build({ memberId: usr1, points: 100, at }));

    // both start before either is awaited
    const first = loyalty.hold(usr1, 100, "ord_1", at);
    const second = loyalty.hold(usr1, 100, "ord_2", at);

    await expect(first).resolves.toBeUndefined();
    await expect(second).rejects.toRefuseWith(refusal(InsufficientPointsError));
    expect(await ledger.balance(usr1)).toBe(0);
  });

  /** A repeated hold for one reference holds nothing more. */
  it("holds once per reference", async () => {
    await ledger.append(pointsEntry.build({ memberId: usr1, points: 100, at }));

    await loyalty.hold(usr1, 60, "ord_1", at);
    await loyalty.hold(usr1, 60, "ord_1", at);

    expect(await ledger.balance(usr1)).toBe(40);
  });

  /** Settle is balance-neutral and release gives the points back once, whichever runs first. */
  it("gives held points back exactly once, settled or not, in either order", async () => {
    await ledger.append(pointsEntry.build({ memberId: usr1, points: 100, at }));
    await loyalty.hold(usr1, 30, "ord_1", at);
    await loyalty.hold(usr1, 20, "ord_2", at);

    expect(await loyalty.settle(usr1, "ord_1", at)).toBe(30);
    expect(await ledger.balance(usr1)).toBe(50);
    expect(await loyalty.release(usr1, "ord_1", at)).toBe(30);
    expect(await loyalty.release(usr1, "ord_2", at)).toBe(20);
    expect(await loyalty.settle(usr1, "ord_2", at)).toBe(0);
    expect(await loyalty.release(usr1, "ord_1", at)).toBe(0);

    expect(await ledger.balance(usr1)).toBe(100);
  });
});
