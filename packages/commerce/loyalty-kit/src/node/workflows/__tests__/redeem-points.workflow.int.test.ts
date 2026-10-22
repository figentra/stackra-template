/**
 * Stackra file contract:
 * Purpose: proves both ends of the redemption saga against a real database and the native engine:
 *          a confirmed redemption keeps its debit past the wait, and an unconfirmed one is credited
 *          back when the wait times out.
 * Boundary: integration tier (.int): Testcontainers Postgres, the postgres outbox, frozen clock and
 *           ids. One module for the file, seeded once; each case uses its own demo member, so the
 *           cases do not depend on each other's order.
 * Runtime: node
 * Governing contract: ADR 0151 (engine conformance), 0152 decision 1 (`waitFor`), 0182, ADR 0022
 */
import { beforeAll, describe, expect, it, freezeClock, freezeIds } from "@stackra/testing";
import { refusal } from "@stackra/errors/testing";
import { Refusals } from "#stackra/manifest";
import { createTestingModule, type TestingApp } from "@stackra/container/testing";
import { run } from "@stackra/actions/testing";
import { actors } from "@stackra/iam/testing";
import { usePostgres } from "@stackra/database/testing";
import { LoyaltyLedger, LoyaltyMembers } from "@acme/loyalty-kit/contracts";
import { memberId } from "@acme/loyalty-kit";
import { LoyaltyKitModule } from "@acme/loyalty-kit/node";
import { DemoSeeder, FakeLoyaltyMembers } from "@acme/loyalty-kit/testing";
import { ConfirmRedemptionAction } from "#node/actions/confirm-redemption.action";
import { RedeemPointsAction } from "#node/actions/redeem-points.action";
import { RedeemPointsWorkflow } from "#node/workflows/redeem-points.workflow";

usePostgres();

/** Guards the redemption saga, where a failed step must never leave points debited. */
describe(RedeemPointsWorkflow, () => {
  let app: TestingApp;

  beforeAll(async () => {
    freezeClock("2026-10-21T09:00:00Z");
    freezeIds();
    app = await createTestingModule(LoyaltyKitModule)
      .useDrivers({
        database: "postgres",
        events: "postgres-outbox",
        queue: "memory",
        workflow: "native",
      })
      .seed(DemoSeeder) // every demo member holds 1 000 points
      .override(
        LoyaltyMembers,
        FakeLoyaltyMembers.with([DemoSeeder.ids.silver, DemoSeeder.ids.gold]),
      )
      .compile();
  });

  /**
   * The happy path: the host confirms inside the wait, so the run finishes and the debit stays even
   * after the clock passes the wait.
   */
  it("keeps the debit when the host confirms within the wait", async () => {
    const silver = memberId(DemoSeeder.ids.silver);
    const as = actors.customer(DemoSeeder.ids.silver);

    const result = await run(
      RedeemPointsAction,
      { points: 300, reference: "ord_2", totalMinor: 10_000 },
      { as, idempotencyKey: "k2" },
    );
    await run(ConfirmRedemptionAction, { reference: "ord_2" }, { as });
    await app.workflows.advanceClock("16m"); // past the wait: a confirmed run never compensates

    const record = await app.workflows.last(RedeemPointsAction);
    expect(record.steps.map((s) => `${s.name}:${s.status}`)).toEqual([
      "quote:done",
      "debit:done",
      "confirm:done",
    ]);
    await expect(app.get(LoyaltyLedger)).toHaveBalance(silver, 700);
    expect(result.output).toMatchObject({ points: 300, balance: 700 });
  });

  /**
   * The compensation path is the reason this is a workflow; the step record proves the engine ran
   * it in reverse.
   */
  it("credits the points back when the host never confirms", async () => {
    const gold = memberId(DemoSeeder.ids.gold);

    const result = await run(
      RedeemPointsAction,
      { points: 300, reference: "ord_1", totalMinor: 10_000 },
      { as: actors.customer(DemoSeeder.ids.gold), idempotencyKey: "k1" },
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
