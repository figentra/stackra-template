/**
 * Stackra file contract:
 * Purpose: proves an earn that crosses a tier threshold promotes the account end to end: ledger
 *          append, outbox, `points.earned` v2, then the listener's promotion.
 * Boundary: integration tier (.int): Testcontainers Postgres, the postgres outbox, the demo seed,
 *           frozen clock; settings faked so the silver threshold is small.
 * Runtime: node
 * Governing contract: ADR 0078 (outbox), ADR 0141, ADR 0182 (integration tier), ADR 0294
 *                     (decision 16), ADR 0022
 */
import { memberId } from "@acme/loyalty-kit";
import { LoyaltyMembers, LoyaltyTier } from "@acme/loyalty-kit/contracts";
import { LoyaltyKitModule } from "@acme/loyalty-kit/node";
import { LoyaltyMembersFake, LoyaltyKitDemoSeeder } from "@acme/loyalty-kit/testing";
import { createTestingModule } from "@stackra/container/testing";
import { usePostgres } from "@stackra/database/testing";
import { drainOutbox } from "@stackra/events/testing";
import { SettingsReader } from "@stackra/settings";
import { fakeSettings } from "@stackra/settings/testing";
import { describe, expect, freezeClock, it } from "@stackra/testing";
import { LoyaltyKitSettings } from "#node/loyalty-kit.settings";
import { AccountService } from "#node/services/account.service";

usePostgres(); // one container for this file; the compiled migrations run once

/**
 * Guards the loop from purchase to tier: if the event is not published, members never get their
 * benefits.
 */
describe(AccountService, () => {
  /**
   * 1 000 seeded + 600 earned crosses silverFrom 1 500 only after the outbox delivers
   * `points.earned`.
   */
  it("promotes the account once the earn crosses a tier threshold", async () => {
    freezeClock("2026-10-21T00:00:00Z");
    const app = await createTestingModule(LoyaltyKitModule)
      .useDrivers({ database: "postgres", events: "postgres-outbox", queue: "memory" })
      .seed(LoyaltyKitDemoSeeder) // LoyaltyKitDemoSeeder.ids.bronze: 1 000 points
      .override(LoyaltyMembers, LoyaltyMembersFake.with([]))
      .override(
        SettingsReader,
        fakeSettings([
          [LoyaltyKitSettings, { expiryMonths: 12, tiers: { silverFrom: 1_500, goldFrom: 9_000 } }],
        ]),
      )
      .compile();
    const accounts = app.get(AccountService);

    await app.transaction(async () => {
      await accounts.earn(memberId(LoyaltyKitDemoSeeder.ids.bronze), {
        amountMinor: 60_000,
        currency: "SAR",
        reference: "ord_big",
      });
    });
    await drainOutbox();

    expect((await accounts.findOneOrFail({ memberId: LoyaltyKitDemoSeeder.ids.bronze })).tier).toBe(
      LoyaltyTier.Silver,
    );
  });
});
