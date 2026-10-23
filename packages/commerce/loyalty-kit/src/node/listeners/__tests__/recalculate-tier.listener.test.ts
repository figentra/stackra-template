/**
 * Stackra file contract:
 * Purpose: proves an earn that crosses the gold threshold promotes the account once the recorded
 *          event is dispatched, and that a lower balance never demotes.
 * Boundary: unit tier; memory drivers, the demo seeder, the after-commit dispatcher drained by
 *           hand; settings faked.
 * Runtime: node
 * Governing contract: ADR 0078, ADR 0141 (the aggregate records, the unit of work ships), ADR 0294
 *                     (decision 16), ADR 0022
 */
import { memberId } from "@acme/loyalty-kit";
import { LoyaltyMembers, LoyaltyTier } from "@acme/loyalty-kit/contracts";
import { LoyaltyKitModule, PointsEarned } from "@acme/loyalty-kit/node";
import { LoyaltyMembersFake, LoyaltyKitDemoSeeder } from "@acme/loyalty-kit/testing";
import { createTestingModule } from "@stackra/container/testing";
import { dispatch, drainEvents } from "@stackra/events/testing";
import { SettingsReader } from "@stackra/settings";
import { fakeSettings } from "@stackra/settings/testing";
import { describe, expect, it } from "@stackra/testing";
import { RecalculateTierListener } from "#node/listeners/recalculate-tier.listener";
import { LoyaltyKitSettings } from "#node/loyalty-kit.settings";
import { AccountService } from "#node/services/account.service";

/** A seeded module whose tenant promotes at 500 (silver) and 1 500 (gold) points. */
function compile() {
  return createTestingModule(LoyaltyKitModule)
    .useDrivers("memory")
    .seed(LoyaltyKitDemoSeeder) // every demo member holds 1 000 points
    .override(LoyaltyMembers, LoyaltyMembersFake.with([LoyaltyKitDemoSeeder.ids.bronze]))
    .override(
      SettingsReader,
      fakeSettings([[LoyaltyKitSettings, { expiryMonths: 12, silverFrom: 500, goldFrom: 1_500 }]]),
    )
    .compile();
}

/** Guards tier promotion driven by earned points, which decides member benefits. */
describe(RecalculateTierListener, () => {
  /**
   * 1 000 seeded + 600 earned = 1 600 ≥ goldFrom 1 500; the promotion must wait for the flush,
   * never happen inline.
   */
  it("promotes to gold when balanceAfter reaches goldFrom", async () => {
    const app = await compile();
    const accounts = app.get(AccountService);
    const { bronze } = LoyaltyKitDemoSeeder.ids;

    await app.transaction(async () => {
      await accounts.earn(memberId(bronze), {
        amountMinor: 60_000,
        currency: "SAR",
        reference: "ord_big",
      });
    });
    await drainEvents();

    expect((await accounts.findOneOrFail({ memberId: bronze })).tier).toBe(LoyaltyTier.Gold);
  });

  /** A gold member whose balance fell below goldFrom keeps gold: the listener only promotes. */
  it("never demotes", async () => {
    const app = await compile();
    const { gold } = LoyaltyKitDemoSeeder.ids;

    await dispatch(
      PointsEarned.create({
        memberId: gold,
        points: 10,
        reference: "ord_small",
        tier: LoyaltyTier.Gold,
        balanceAfter: 600,
      }),
    );
    await drainEvents();

    const account = await app.get(AccountService).findOneOrFail({ memberId: gold });
    expect(account.tier).toBe(LoyaltyTier.Gold);
  });
});
