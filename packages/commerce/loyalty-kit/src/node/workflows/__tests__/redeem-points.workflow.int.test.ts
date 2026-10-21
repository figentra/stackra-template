/**
 * Stackra file contract:
 * Purpose: proves the debit is credited back when confirmation times out, against a real database
 *          and the native engine.
 * Boundary: integration tier (.int): Testcontainers Postgres, the postgres outbox, frozen clock and
 *           ids.
 * Runtime: node
 * Governing contract: ADR 0151 (engine conformance), 0094, 0182, ADR 0022
 */
import { beforeAll, describe, expect, it, freezeClock, freezeIds } from "@stackra/testing";
import { refusal } from "@stackra/errors/testing";
import { Refusals } from "#stackra/manifest";
import { createTestingModule } from "@stackra/container/testing";
import { run } from "@stackra/actions/testing";
import { actors } from "@stackra/iam/testing";
import { usePostgres } from "@stackra/database/testing";
import { LoyaltyLedger, LoyaltyMembers } from "@stackra/loyalty-kit/contracts";
import { memberId } from "@stackra/loyalty-kit";
import { DemoSeeder, LoyaltyKitModule } from "@stackra/loyalty-kit/node";
import { FakeLoyaltyMembers } from "@stackra/loyalty-kit/testing";
import { RedeemPointsAction } from "#node/actions/redeem-points.action";
import { RedeemPointsWorkflow } from "#node/workflows/redeem-points.workflow";

usePostgres();

/** Guards the redemption saga, where a failed step must never leave points debited. */
describe(RedeemPointsWorkflow, () => {
  beforeAll(() => {
    freezeClock("2026-10-21T09:00:00Z");
    freezeIds();
  });

  /**
   * The compensation path is the reason this is a workflow; the step record proves the engine ran
   * it in reverse.
   */
  it("credits the points back when the host never confirms", async () => {
    const app = await createTestingModule(LoyaltyKitModule)
      .useDrivers({
        database: "postgres",
        events: "postgres-outbox",
        queue: "memory",
        workflow: "native",
      })
      .seed(DemoSeeder) // DemoSeeder.members.gold holds 1 000 points
      .override(LoyaltyMembers, FakeLoyaltyMembers.with([DemoSeeder.members.gold]))
      .compile();
    const gold = memberId(DemoSeeder.members.gold);

    const result = await run(
      RedeemPointsAction,
      { points: 300, reference: "ord_1", totalMinor: 10_000 },
      { as: actors.customer(DemoSeeder.members.gold), idempotencyKey: "k1" },
    );
    await expect(app.get(LoyaltyLedger)).toHaveBalance(gold, 700);

    await app.workflows.advanceClock("16m"); // past the confirm step's 15 minute wait
    const record = await app.workflows.last(RedeemPointsAction);
    expect(record.steps.map((s) => `${s.name}:${s.status}`)).toEqual([
      "quote:done",
      "debit:compensated",
      "confirm:timed_out",
    ]);
    await expect(app.get(LoyaltyLedger)).toHaveBalance(gold, 1_000);
    expect(result).toRefuseWith(refusal(Refusals.core.workflow_timed_out));
  });
});
