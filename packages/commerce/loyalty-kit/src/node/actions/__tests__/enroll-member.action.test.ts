/**
 * Stackra file contract:
 * Purpose: proves enroll runs through the pipeline: a customer cannot enroll someone else, staff
 *          can, and the event is recorded once.
 * Boundary: unit tier through the real pipeline (`run` from @stackra/actions/testing), memory
 *           drivers, members faked. The account ids are client-minted, so the test mints them in
 *           the ADR 0231 form.
 * Runtime: node
 * Governing contract: ADR 0098 (one pipeline), ADR 0294 (decision 16), ADR 0022
 */
import { NotOwnPrincipalError } from "@acme/loyalty-kit";
import { LoyaltyMembers, LoyaltyTier } from "@acme/loyalty-kit/contracts";
import { LoyaltyKitModule } from "@acme/loyalty-kit/node";
import { LoyaltyMembersFake } from "@acme/loyalty-kit/testing";
import { run } from "@stackra/actions/testing";
import { createTestingModule } from "@stackra/container/testing";
import { refusal } from "@stackra/errors/testing";
import { actors } from "@stackra/iam/testing";
import { describe, expect, it } from "@stackra/testing";
import { EnrollMemberAction } from "#node/actions/enroll-member.action";
import { AccountEnrolled } from "#node/events/account-enrolled.event";

/** A testing module with memory drivers and no enrolled members. */
function compile() {
  return createTestingModule(LoyaltyKitModule)
    .useDrivers("memory")
    .override(LoyaltyMembers, LoyaltyMembersFake.with([]))
    .compile();
}

/** Guards enrollment authorization and idempotency, the entry point of every loyalty account. */
describe(EnrollMemberAction, () => {
  /**
   * The check lives in the handler (no record exists yet for a policy), so it is proven through the
   * pipeline, not by unit.
   */
  it("refuses a customer enrolling another principal", async () => {
    await compile();
    const input = { accountId: "lac_01JA0000000000000000000011", principalId: "usr_2" } as const;

    const result = await run(EnrollMemberAction, input, { as: actors.customer("usr_1") });

    expect(result).toRefuseWith(refusal(NotOwnPrincipalError));
  });

  /**
   * PUT semantics: the second call returns the first account and records nothing, so a retried
   * client never double-enrolls.
   */
  it("enrolls once and records account.enrolled once", async () => {
    await compile();
    const accountId = "lac_01JA0000000000000000000012";
    const staff = actors.staff("usr_staff");

    const first = await run(
      EnrollMemberAction,
      { accountId, principalId: "usr_1", tier: LoyaltyTier.Silver },
      { as: staff },
    );
    const second = await run(
      EnrollMemberAction,
      { accountId, principalId: "usr_1" },
      { as: staff },
    );

    expect(first).toRecord(AccountEnrolled, { memberId: "usr_1", tier: LoyaltyTier.Silver });
    expect(second.output).toEqual(first.output);
    expect(second).not.toRecord(AccountEnrolled);
  });
});
