/**
 * Stackra file contract:
 * Purpose: the steps behind `loyalty_kit.points.redeem`: quote (verify included), debit, confirm.
 *          The debit is compensated (credited back) when confirmation never comes.
 * Boundary: a declarative graph (ADR 0094): steps run in declaration order; each step is its own
 *           transaction and is idempotent on the run id; `compensate` is typed `keyof` this class.
 *           Never exposed directly (ADR 0101).
 * Runtime: node
 * Governing contract: ADR 0094, 0101, 0151, 0265 (the owner runs its verify point)
 */
import { Step, Workflow, WorkflowBase, type StepContext } from "@stackra/workflow";
import { LoyaltyLedger } from "#contracts/loyalty-ledger.port";
import { LoyaltyService } from "#core/services/loyalty.service";
import { EntryKind } from "#core/enums/entry-kind.enum";
import { memberId } from "#core/functions/member-id.function";
import type { RedeemPointsInput } from "#core/schemas/redeem-points-input.schema";
import type { RedeemPointsOutput } from "#core/schemas/redeem-points-output.schema";
import type { MemberId } from "#core/types/member-id.type";
import type { RedemptionQuote } from "#core/interfaces/redemption-quote.interface";
import { PointsRedeemed } from "#node/events/points-redeemed.event";
import { LoyaltyHooks } from "#node/hooks/loyalty.hook-point";

/** Output of `quote`; later steps read it as `s.quote`. */
interface Quoted {
  /** The branded member taken from the actor, never from input. */
  readonly member: MemberId;
  /** The capped offer. */
  readonly quote: RedemptionQuote;
  /** The caller's reference, the idempotency key of the debit. */
  readonly reference: string;
}

/**
 * `output` maps step results to the action's declared output, so the workflow stays private to the
 * kit.
 */
@Workflow({ timeout: "30s" })
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
    const member = memberId(ctx.actor.id);
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
   * Confirms with the host through a signal: the host's own step (an order placement) resolves it,
   * or the engine times out and compensates. This is the step that makes the whole thing a workflow
   * instead of an action.
   */
  @Step({ wait: { signal: "confirmed", timeout: "15m" } })
  async confirm(_input: void, ctx: StepContext): Promise<void> {
    await ctx.waitForSignal("confirmed");
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
