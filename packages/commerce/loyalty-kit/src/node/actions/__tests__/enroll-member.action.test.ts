/**
 * Stackra file contract:
 * Purpose: proves enroll runs through the pipeline: a customer cannot enroll someone else, staff
 *          can, and the event is recorded once.
 * Boundary: unit tier through the real pipeline (`run` from @stackra/actions/testing), memory
 *           drivers, members faked.
 * Runtime: node
 * Governing contract: ADR 0098 (one pipeline), ADR 0022, ADR 0007 (amended: test docblocks)
 */
import { describe, expect, it } from "@stackra/testing";
import { refusal } from "@stackra/errors/testing";
import { Refusals } from "#stackra/manifest";
import { createTestingModule } from "@stackra/container/testing";
import { run } from "@stackra/actions/testing";
import { actors } from "@stackra/iam/testing";
import { LoyaltyMembers, LoyaltyTier } from "@acme/loyalty-kit/contracts";
import { LoyaltyKitModule } from "@acme/loyalty-kit/node";
import { FakeLoyaltyMembers } from "@acme/loyalty-kit/testing";
import { AccountEnrolled } from "#node/events/account-enrolled.event";
import { EnrollMemberAction } from "#node/actions/enroll-member.action";

const compile = () =>
  createTestingModule(LoyaltyKitModule)
    .useDrivers("memory")
    .override(LoyaltyMembers, FakeLoyaltyMembers.with([]))
    .compile();

/** Guards enrollment authorization and idempotency, the entry point of every loyalty account. */
describe(EnrollMemberAction, () => {
  /**
   * The check lives in the handler (no record exists yet for a policy), so it is proven through the
   * pipeline, not by unit.
   */
  it("refuses a customer enrolling another principal", async () => {
    await compile();
    expect(
      await run(
        EnrollMemberAction,
        { accountId: "lac_a", principalId: "usr_2" },
        { as: actors.customer("usr_1") },
      ),
    ).toRefuseWith(refusal(Refusals.loyalty_kit.not_own_principal));
  });

  /**
   * PUT semantics: the second call returns the first account and records nothing, so a retried
   * client never double-enrolls.
   */
  it("enrolls once and records account.enrolled once", async () => {
    await compile();
    const first = await run(
      EnrollMemberAction,
      { accountId: "lac_b", principalId: "usr_1", tier: LoyaltyTier.Silver },
      { as: actors.staff("usr_staff") },
    );
    const second = await run(
      EnrollMemberAction,
      { accountId: "lac_b", principalId: "usr_1" },
      { as: actors.staff("usr_staff") },
    );

    expect(first).toRecord(AccountEnrolled, { memberId: "usr_1", tier: LoyaltyTier.Silver });
    expect(second.output).toEqual(first.output);
    expect(second).not.toRecord(AccountEnrolled);
  });
});
