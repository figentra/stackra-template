/**
 * Stackra file contract:
 * Purpose: `loyalty_kit.account.freeze`: freeze or unfreeze an account for review. Bound as a row
 *          and bulk action of the account resource, so the console shows its confirmation and
 *          success message.
 * Boundary: single aggregate, inline; its permission is L2, so an agent may call it only as an
 *           opted-in tool.
 * Runtime: node
 * Governing contract: ADR 0098, 0139
 */
import { Action, AsEndpoint, AsTool, UxAfter, type ActionContext } from "@stackra/actions";
import { ActorKind, HttpMethod, Tone } from "@stackra/contracts";
import { I18n } from "#stackra/i18n";
import { FreezeAccountInput } from "#core/schemas/freeze-account-input.schema";
import { FreezeAccountOutput } from "#core/schemas/freeze-account-output.schema";
import { AccountService } from "#node/services/account.service";
import { LoyaltyAccountPermissions } from "#node/permissions/loyalty-account.permission";

/** Idempotent (PUT): freezing a frozen account changes nothing and records nothing. */
@Action({
  key: "account.freeze",
  input: FreezeAccountInput,
  output: FreezeAccountOutput,
  permission: LoyaltyAccountPermissions.freeze,
  actors: [ActorKind.User, ActorKind.Agent],
  ux: {
    requiresConfirmation: { text: I18n.loyalty_kit.account.freeze_confirm, color: Tone.Warning },
    success: I18n.loyalty_kit.account.frozen,
    after: [UxAfter.Refresh],
  },
})
@AsEndpoint({ method: HttpMethod.Put, path: "/loyalty/accounts/:accountId/freeze" })
@AsTool()
export class FreezeAccountAction {
  constructor(private readonly accounts: AccountService) {}

  /**
   * Loads the account, authorizes the freeze against it and sets the flag.
   * @throws a `NotFound` refusal when no account has this id in the actor's tenant;
   * `Forbidden` when the policy denies.
   */
  async handle(input: FreezeAccountInput, ctx: ActionContext): Promise<FreezeAccountOutput> {
    const account = await this.accounts.findOneOrFail({ id: input.accountId });
    await ctx.authorize(LoyaltyAccountPermissions.freeze, account);
    await this.accounts.setFrozen(account, input.isFrozen, ctx.now());
    return { accountId: account.id, isFrozen: account.isFrozen };
  }
}
