/**
 * Stackra file contract:
 * Purpose: proves an earn that crosses a tier threshold promotes the account end to end: ledger
 *          append, outbox, `points.earned` v2, then the listener's promotion.
 * Boundary: integration tier (.int): Testcontainers Postgres, the postgres outbox, the demo seed,
 *           frozen clock; settings faked so the silver threshold is small.
 * Runtime: node
 * Governing contract: ADR 0078 (outbox), ADR 0141, ADR 0182 (integration tier), ADR 0022
 */
import { describe, expect, it, freezeClock } from "@stackra/testing";
import { createTestingModule } from "@stackra/container/testing";
import { usePostgres } from "@stackra/database/testing";
import { drainOutbox } from "@stackra/events/testing";
import { SettingsReader } from "@stackra/settings";
import { fakeSettings } from "@stackra/settings/testing";
import { LoyaltyMembers, LoyaltyTier } from "@stackra/loyalty-kit/contracts";
import { memberId } from "@stackra/loyalty-kit";
import { DemoSeeder, LoyaltyKitModule } from "@stackra/loyalty-kit/node";
import { FakeLoyaltyMembers } from "@stackra/loyalty-kit/testing";
import { AccountService } from "#node/services/account.service";
import { LoyaltySettings } from "#node/settings/loyalty.setting";

usePostgres();

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
      .seed(DemoSeeder) // DemoSeeder.members.bronze: 1 000 points
      .override(LoyaltyMembers, FakeLoyaltyMembers.with([]))
      .override(
        SettingsReader,
        fakeSettings([[LoyaltySettings, { expiryMonths: 12, silverFrom: 1_500, goldFrom: 9_000 }]]),
      )
      .compile();
    const accounts = app.get(AccountService);

    await app.transaction(async () => {
      await accounts.earn(memberId(DemoSeeder.members.bronze), {
        amountMinor: 60_000,
        currency: "SAR",
        reference: "ord_big",
      });
    });
    await drainOutbox();

    expect((await accounts.findOneOrFail({ memberId: DemoSeeder.members.bronze })).tier).toBe(
      LoyaltyTier.Silver,
    );
  });
});
