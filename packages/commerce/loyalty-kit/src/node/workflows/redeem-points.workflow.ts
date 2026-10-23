/**
 * Stackra file contract:
 * Purpose: the steps behind `loyalty_kit.points.redeem`: quote (verify included), debit, confirm.
 *          The debit is undone (credited back) when confirmation never comes.
 * Boundary: the public async methods are the steps, run in declaration order; `undoDebit`
 *           compensates `debit`; `output` maps the results to the action's output. Each step is
 *           its own transaction and is idempotent on the run id. The run parks before `confirm`
 *           until ConfirmRedemptionAction sends RedemptionConfirmed for the same member and
 *           reference; no step body waits, so the same graph runs on any workflow engine. The run
 *           timeout covers that wait. Started only by RedeemPointsAction through `ctx.run`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 6, 16 and 18), ADR 0101, ADR 0151, ADR 0152 decision 1
 *                     (`waitFor`), ADR 0265 (the owner runs its verify point)
 */
import { type Run, Step, type StepContext, Workflow } from "@stackra/workflow";
import { EntryKind } from "#contracts/enums/entry-kind.enum";
import type { LoyaltyLedger } from "#contracts/ports/loyalty-ledger.port";
import { memberId } from "#core/functions/member-id.function";
import type { RedeemPointsInput } from "#core/schemas/redeem-points-input.schema";
import { RedeemPointsOutput } from "#core/schemas/redeem-points-output.schema";
import type { LoyaltyService } from "#core/services/loyalty.service";
import { PointsRedeemed } from "#node/events/points-redeemed.event";
import type { LoyaltyKitExtensionPoint } from "#node/extensions/loyalty-kit.extension-point";
import { QuotedRedemption } from "#node/schemas/quoted-redemption.schema";
import { RedemptionConfirmed } from "#node/workflows/redemption-confirmed.signal";

/** The run timeout is the confirmation wait plus room for the quote and the debit. */
export class RedeemPointsWorkflow extends Workflow<RedeemPointsInput>({ timeout: "20m" }) {
  /** Each step's collaborator. */
  constructor(
    private readonly loyalty: LoyaltyService,
    private readonly ledger: LoyaltyLedger,
    private readonly extensions: LoyaltyKitExtensionPoint,
  ) {
    super();
  }

  /**
   * Verifies (the kit's own rules, then every `redeemVerify` implementer) and quotes; no side
   * effects, so no undo.
   * @throws NotAMemberError, InsufficientPointsError, or the first implementer's refusal.
   */
  async quote(run: Run<this>, ctx: StepContext): Promise<QuotedRedemption> {
    const member = memberId((ctx.actor.onBehalfOf ?? ctx.actor).id);
    await this.loyalty.assertCanRedeem(member, run.input.points);
    await this.extensions.redeemVerify(run.input, ctx);
    const quote = await this.loyalty.quote(member, run.input.points, run.input.totalMinor);
    return QuotedRedemption.create({
      memberId: member,
      points: quote.points,
      amountMinor: quote.amountMinor,
      reference: run.input.reference,
    });
  }

  /**
   * Takes the points off the ledger; `points.redeemed` is dispatched when this step's transaction
   * commits.
   * @returns the member's balance after the debit.
   */
  async debit(run: Run<this>, ctx: StepContext): Promise<number> {
    const { memberId: member, points, reference } = run.results.quote;
    const balance = await this.loyalty.redeem(memberId(member), points, reference, ctx.now());
    ctx.record(PointsRedeemed.create({ memberId: member, points, reference }));
    return balance;
  }

  /**
   * Undoes `debit`: an `Adjust` entry under a derived reference, so repeating it credits nothing
   * twice.
   */
  async undoDebit(run: Run<this>, ctx: StepContext): Promise<void> {
    const { memberId: member, points, reference } = run.results.quote;
    await this.ledger.append({
      memberId: memberId(member),
      points,
      kind: EntryKind.Adjust,
      reference: `revert:${reference}`,
      at: ctx.now(),
    });
  }

  /**
   * Runs once the host confirms: the run parks before this step until RedemptionConfirmed arrives
   * for this member and reference, or the 15 minutes pass and the engine undoes `debit`. This wait
   * is what makes the redemption a workflow instead of an action.
   * @returns the confirmation as received, kept in the run record for support.
   */
  @Step<RedeemPointsWorkflow>({
    waitFor: RedemptionConfirmed,
    correlate: (run) => ({
      memberId: run.results.quote.memberId,
      reference: run.results.quote.reference,
    }),
    timeout: "15m",
  })
  async confirm(
    _run: Run<this>,
    _ctx: StepContext,
    confirmed: RedemptionConfirmed,
  ): Promise<RedemptionConfirmed> {
    return confirmed;
  }

  /** The action's output, built from the step results. */
  output(run: Run<this>): RedeemPointsOutput {
    return RedeemPointsOutput.create({
      points: run.results.quote.points,
      amountMinor: run.results.quote.amountMinor,
      balance: run.results.debit,
    });
  }
}
