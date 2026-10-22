/**
 * Stackra file contract:
 * Purpose: proves an earn that crosses the gold threshold promotes the account, once the recorded
 *          event is dispatched.
 * Boundary: unit tier; memory drivers, the demo seeder, the after-commit dispatcher drained by
 *           hand; settings faked.
 * Runtime: node
 * Governing contract: ADR 0078, ADR 0022, ADR 0141 (the aggregate records, the unit of work ships)
 */
import { describe, expect, it } from "@stackra/testing";
import { createTestingModule } from "@stackra/container/testing";
import { drainEvents } from "@stackra/events/testing";
import { SettingsReader } from "@stackra/settings";
import { fakeSettings } from "@stackra/settings/testing";
import { LoyaltyMembers, LoyaltyTier } from "@acme/loyalty-kit/contracts";
import { memberId } from "@acme/loyalty-kit";
import { LoyaltyKitModule } from "@acme/loyalty-kit/node";
import { DemoSeeder, FakeLoyaltyMembers } from "@acme/loyalty-kit/testing";
import { AccountService } from "#node/services/account.service";
import { RecalculateTierListener } from "#node/listeners/recalculate-tier.listener";
import { LoyaltySettings } from "#node/settings/loyalty.setting";

/** Guards tier promotion driven by earned points, which decides member benefits. */
describe(RecalculateTierListener, () => {
  /**
   * 1 000 seeded + 600 earned = 1 600 ≥ goldFrom 1 500; the promotion must wait for the flush,
   * never happen inline.
   */
  it("promotes to gold when balanceAfter reaches goldFrom", async () => {
    const app = await createTestingModule(LoyaltyKitModule)
      .useDrivers("memory")
      .seed(DemoSeeder) // DemoSeeder.ids.bronze: 1 000 points
      .override(LoyaltyMembers, FakeLoyaltyMembers.with([DemoSeeder.ids.bronze]))
      .override(
        SettingsReader,
        fakeSettings([[LoyaltySettings, { expiryMonths: 12, silverFrom: 500, goldFrom: 1_500 }]]),
      )
      .compile();
    const accounts = app.get(AccountService);

    await app.transaction(async () => {
      await accounts.earn(memberId(DemoSeeder.ids.bronze), {
        amountMinor: 60_000,
        currency: "SAR",
        reference: "ord_big",
      });
    });
    await drainEvents();

    expect((await accounts.findOneOrFail({ memberId: DemoSeeder.ids.bronze })).tier).toBe(
      LoyaltyTier.Gold,
    );
  });
});
