/**
 * Stackra file contract:
 * Purpose: proves the balance query is served from cache within the TTL and recomputed after
 *          points.earned.
 * Boundary: unit tier through the pipeline with the memory cache driver; the clock is frozen to pin
 *           the expiry date.
 * Runtime: node
 * Governing contract: ADR 0137 (cache step), ADR 0294 (decision 16), ADR 0022
 */
import { LoyaltyMembers, LoyaltyTier } from "@acme/loyalty-kit/contracts";
import { LoyaltyKitModule, PointsEarned } from "@acme/loyalty-kit/node";
import { FakeLoyaltyMembers, LoyaltyKitDemoSeeder } from "@acme/loyalty-kit/testing";
import { run } from "@stackra/actions/testing";
import { createTestingModule } from "@stackra/container/testing";
import { dispatch, drainEvents } from "@stackra/events/testing";
import { actors } from "@stackra/iam/testing";
import { describe, expect, freezeClock, it } from "@stackra/testing";
import { GetBalanceQuery } from "#node/queries/get-balance.query";
import { AccountService } from "#node/services/account.service";

/** Guards the balance read path, where a stale cache would show members the wrong points. */
describe(GetBalanceQuery, () => {
  /**
   * A second identical call within a minute is a hit; one `points.earned` turns the next call into
   * a miss.
   */
  it("caches per account and invalidates on points.earned", async () => {
    freezeClock("2026-10-21T10:00:00Z");
    const { gold } = LoyaltyKitDemoSeeder.ids;
    const app = await createTestingModule(LoyaltyKitModule)
      .useDrivers("memory")
      .seed(LoyaltyKitDemoSeeder)
      .override(LoyaltyMembers, FakeLoyaltyMembers.with([gold]))
      .compile();
    const as = actors.customer(gold);
    const { id: accountId } = await app.get(AccountService).findOneOrFail({ memberId: gold });

    const first = await run(GetBalanceQuery, { accountId }, { as });
    expect(first.output).toMatchObject({
      tier: LoyaltyTier.Gold,
      balance: 1_000,
      nextExpiryAt: new Date("2027-10-21T10:00:00.000Z"),
    });
    expect((await run(GetBalanceQuery, { accountId }, { as })).meta.cache).toBe("hit");

    await dispatch(
      PointsEarned.create({
        memberId: gold,
        points: 10,
        reference: "ord_x",
        tier: LoyaltyTier.Gold,
        balanceAfter: 1_010,
      }),
    );
    await drainEvents();
    expect((await run(GetBalanceQuery, { accountId }, { as })).meta.cache).toBe("miss");
  });
});
