/**
 * Stackra file contract:
 * Purpose: `loyalty_kit.points.confirm_redemption`: the host's "the order went through" for a
 *          redemption, so the parked RedeemPointsWorkflow keeps the debit instead of crediting it
 *          back when its wait times out.
 * Boundary: inline and idempotent (PUT): it only sends RedemptionConfirmed, the one way a waiting
 *           run resumes, so permission, tenancy and the audit trail apply to every confirmation.
 *           The member is the actor, or the customer a service acts for; a member confirms only
 *           their own redemption, because the waiting step correlates on member and reference.
 * Runtime: node
 * Governing contract: ADR 0098, ADR 0101, ADR 0152 decision 1 (`waitFor`)
 */
import { Action, AsEndpoint, type ActionContext } from "@stackra/actions";
import { ActorKind, HttpMethod } from "@stackra/contracts";
import { memberId } from "#core/functions/member-id.function";
import { ConfirmRedemptionInput } from "#core/schemas/confirm-redemption-input.schema";
import { ConfirmRedemptionOutput } from "#core/schemas/confirm-redemption-output.schema";
import { LoyaltyAccountPermissions } from "#node/permissions/loyalty-account.permission";
import { RedemptionConfirmed } from "#node/workflows/redemption-confirmed.signal";

/**
 * Called by the host once its own step succeeded, usually by a service acting for the customer; a
 * repeated call sends the same signal and changes nothing.
 */
@Action({
  key: "points.confirm_redemption",
  input: ConfirmRedemptionInput,
  output: ConfirmRedemptionOutput,
  permission: LoyaltyAccountPermissions.redeem,
  actors: [ActorKind.User, ActorKind.Service],
})
@AsEndpoint({ method: HttpMethod.Put, path: "/loyalty/redemptions/:reference/confirm" })
export class ConfirmRedemptionAction {
  /** Sends the signal the redemption's `confirm` step waits for; the engine holds an early one. */
  async handle(
    input: ConfirmRedemptionInput,
    ctx: ActionContext,
  ): Promise<ConfirmRedemptionOutput> {
    const member = memberId((ctx.actor.onBehalfOf ?? ctx.actor).id);
    await ctx.signal(RedemptionConfirmed, { memberId: member, reference: input.reference });
    return { reference: input.reference };
  }
}
