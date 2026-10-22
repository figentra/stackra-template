/**
 * Stackra file contract:
 * Purpose: `loyalty_kit.points.redeem`: spend points against an amount. The work runs in
 *          RedeemPointsWorkflow because the debit must be undone if the host's later step fails
 *          (compensation, ADR 0101): the host confirms with `loyalty_kit.points.confirm_redemption`
 *          within 15 minutes, or the points are credited back.
 * Boundary: no handle(): `runs:` is the only line that changed when the body moved into steps.
 * Runtime: node
 * Governing contract: ADR 0098, 0101
 */
import { Action, AsEndpoint, Idempotency } from "@stackra/actions";
import { ActorKind, HttpMethod } from "@stackra/contracts";
import { RedeemPointsInput } from "#core/schemas/redeem-points-input.schema";
import { RedeemPointsOutput } from "#core/schemas/redeem-points-output.schema";
import { LoyaltyAccountPermissions } from "#node/permissions/loyalty-account.permission";
import { RedeemPointsWorkflow } from "#node/workflows/redeem-points.workflow";

/**
 * Idempotency is required: a retried redeem with the same key returns the first result instead of
 * debiting twice.
 */
@Action({
  key: "points.redeem",
  input: RedeemPointsInput,
  output: RedeemPointsOutput,
  permission: LoyaltyAccountPermissions.redeem,
  actors: [ActorKind.User, ActorKind.Service],
  idempotency: Idempotency.Required,
  rateLimit: { perMinute: 30 },
  runs: RedeemPointsWorkflow,
})
@AsEndpoint({ method: HttpMethod.Post, path: "/loyalty/redemptions" })
export class RedeemPointsAction {}
