/**
 * Stackra file contract:
 * Purpose: the steps behind `loyalty_kit.points.redeem`: quote (verify included), debit, confirm.
 *          The debit is compensated (credited back) when confirmation never comes.
 * Boundary: steps run in declaration order; each step is its own transaction and is idempotent on
 *           the run id; `compensate` is typed `keyof` this class. The run parks before `confirm`
 *           until ConfirmRedemptionAction sends RedemptionConfirmed for the same member and
 *           reference; no step body waits. The run timeout covers that wait. Never exposed
 *           directly (ADR 0101).
 * Runtime: node
 * Governing contract: ADR 0101, 0151, 0152 decision 1 (`waitFor`), 0265 (the owner runs its verify
 *                     point)
 */
import { Step, Workflow, WorkflowBase, type StepContext } from "@stackra/workflow";
import type { LoyaltyLedger } from "#contracts/loyalty-ledger.port";
import type { LoyaltyService } from "#core/services/loyalty.service";
import { EntryKind } from "#core/enums/entry-kind.enum";
import { memberId } from "#core/functions/member-id.function";
import type { RedeemPointsInput } from "#core/schemas/redeem-points-input.schema";
import type { RedeemPointsOutput } from "#core/schemas/redeem-points-output.schema";
import type { MemberId } from "#core/types/member-id.type";
import type { RedemptionQuote } from "#core/interfaces/redemption-quote.interface";
import { PointsRedeemed } from "#node/events/points-redeemed.event";
import type { LoyaltyHooks } from "#node/hooks/loyalty.hook-point";
import { RedemptionConfirmed } from "#node/workflows/redemption-confirmed.signal";

/** Output of `quote`; later steps read it as `s.quote`. */
interface Quoted {
  /** The branded member taken from the actor (or the customer a service acts for), never input. */
  readonly member: MemberId;
  /** The capped offer. */
  readonly quote: RedemptionQuote;
  /** The caller's reference, the idempotency key of the debit. */
  readonly reference: string;
}

/**
 * `output` maps step results to the action's declared output, so the workflow stays private to the
 * kit. The run timeout is the confirmation wait plus room for the quote and the debit.
 */
@Workflow({ timeout: "20m" })
export class RedeemPointsWorkflow extends WorkflowBase<RedeemPointsInput, RedeemPointsOutput> {
  constructor(
    private readonly loyalty: LoyaltyService,
    private readonly ledger: LoyaltyLedger,
    private readonly hooks: LoyaltyHooks,
  ) {
    super();
  }

  /**
   * Verifies (the kit's own rules, then every `redeemVerify` implementer) and quotes; no side
   * effects, so no compensation.
   * @throws NotAMemberError, InsufficientPointsError, or the first implementer's refusal.
   */
  @Step()
  async quote(input: RedeemPointsInput, ctx: StepContext): Promise<Quoted> {
    const member = memberId((ctx.actor.onBehalfOf ?? ctx.actor).id);
    await this.loyalty.assertCanRedeem(member, input.points);
    await this.hooks.redeemVerify(input, ctx);
    return {
      member,
      quote: await this.loyalty.quote(member, input.points, input.totalMinor),
      reference: input.reference,
    };
  }

  /**
   * Takes the points off the ledger; `points.redeemed` is dispatched when this step's transaction
   * commits.
   */
  @Step<RedeemPointsWorkflow>({ input: (s) => s.quote, compensate: "credit" })
  async debit(
    { member, quote, reference }: Quoted,
    ctx: StepContext,
  ): Promise<{ balance: number }> {
    const balance = await this.loyalty.redeem(member, quote.points, reference, ctx.now());
    ctx.record(new PointsRedeemed({ memberId: member, points: quote.points, reference }));
    return { balance };
  }

  /**
   * Compensation of `debit`: an `Adjust` entry under a derived reference, so repeating it credits
   * nothing twice.
   */
  async credit({ member, quote, reference }: Quoted, ctx: StepContext): Promise<void> {
    await this.ledger.append({
      memberId: member,
      points: quote.points,
      kind: EntryKind.Adjust,
      reference: `revert:${reference}`,
      at: ctx.now(),
    });
  }

  /**
   * Runs once the host confirms: the run parks before this step until ConfirmRedemptionAction
   * sends RedemptionConfirmed for this member and reference, or the 15 minutes pass and the engine
   * compensates `debit`. This wait is what makes the redemption a workflow instead of an action.
   * @returns the confirmation as received, kept in the run record for support.
   */
  @Step<RedeemPointsWorkflow>({
    waitFor: RedemptionConfirmed,
    correlate: (s) => ({ memberId: s.quote.member, reference: s.quote.reference }),
    timeout: "15m",
  })
  async confirm(confirmed: RedemptionConfirmed): Promise<RedemptionConfirmed> {
    return confirmed;
  }

  /** The action's output, typed against RedeemPointsOutput. */
  output(s: this["results"]): RedeemPointsOutput {
    return {
      points: s.quote.quote.points,
      amountMinor: s.quote.quote.amountMinor,
      balance: s.debit.balance,
    };
  }
}
