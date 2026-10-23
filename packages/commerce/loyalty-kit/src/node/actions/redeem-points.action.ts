/**
 * Stackra file contract:
 * Purpose: `loyalty_kit.points.redeem@1`: spend points against an amount. The work runs in
 *          RedeemPointsWorkflow because the debit must be undone if the host's later step fails:
 *          the host confirms with `loyalty_kit.points.confirm_redemption` within 15 minutes, or
 *          the points are credited back.
 * Boundary: the action is the contract (key, input and output, permission, idempotency, rate
 *           limit); `handle` hands the input to the workflow and returns its output, so callers
 *           never see the workflow. The template's path is kept, so the endpoint is written.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 3, 16, 18 and 21), ADR 0098, ADR 0101
 */
import { Action, type ActionContext, Idempotency } from "@stackra/actions";
import { ActorKind, HttpMethod } from "@stackra/contracts";
import type { RedeemPointsInput } from "#core/schemas/redeem-points-input.schema";
import type { RedeemPointsOutput } from "#core/schemas/redeem-points-output.schema";
import { LoyaltyAccountPermissions } from "#node/access/loyalty-account.permissions";
import { RedeemPointsWorkflow } from "#node/workflows/redeem-points.workflow";

/**
 * Idempotency is required: a retried redeem with the same key returns the first result instead of
 * debiting twice.
 */
export class RedeemPointsAction extends Action({
  key: "points.redeem",
  permission: LoyaltyAccountPermissions.redeem,
  actors: [ActorKind.User, ActorKind.Service],
  idempotency: Idempotency.Required,
  rateLimit: { perMinute: 30 },
  endpoint: {
    method: HttpMethod.Post,
    path: "/loyalty/redemptions",
  },
}) {
  /** Starts the redemption run and returns its output through the same pipeline. */
  async handle(input: RedeemPointsInput, ctx: ActionContext): Promise<RedeemPointsOutput> {
    return ctx.run(RedeemPointsWorkflow, input);
  }
}
