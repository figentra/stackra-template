/**
 * Stackra file contract:
 * Purpose: `loyalty_kit.account.freeze@1`: freeze or unfreeze an account for review. Placed by the
 *          account resource on rows, the View page and the bulk bar.
 * Boundary: single aggregate, inline. Its permission is L2, so the panel asks a person to confirm
 *           it and an agent may call the tool only with approval; LoyaltyAccountPolicy#freeze
 *           refines it through `ctx.authorize(account)`. The template's path is kept, so
 *           `endpoint` is written. The confirmation and success texts are the derived keys
 *           `loyalty_kit::actions.account.freeze.confirm` and `.success`; no UX option is written.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 2, 3, 16 and 21, as amended by programming model v3.1,
 *                     AGENTS.md), ADR 0098, ADR 0099 (risk)
 */
import { Action, type ActionContext } from "@stackra/actions";
import { ActorKind, HttpMethod } from "@stackra/contracts";
import { LoyaltyAccountPermissions } from "#node/access/loyalty-account.permissions";
import type { FreezeAccountInput } from "#node/schemas/freeze-account-input.schema";
import { FreezeAccountOutput } from "#node/schemas/freeze-account-output.schema";
import type { AccountService } from "#node/services/account.service";

/** Idempotent (PUT): freezing a frozen account changes nothing and records nothing. */
export class FreezeAccountAction extends Action({
  key: "account.freeze",
  permission: LoyaltyAccountPermissions.freeze,
  actors: [ActorKind.User, ActorKind.Agent],
  endpoint: {
    method: HttpMethod.Put,
    path: "/loyalty/accounts/:accountId/freeze",
  },
  tool: true,
}) {
  /**
   * @param accounts - loads the account and flips the flag.
   */
  constructor(private readonly accounts: AccountService) {
    super();
  }

  /**
   * Loads the account, authorizes the freeze against it and sets the flag.
   * @throws Refusal `not_found` when no account has this id in the actor's tenant; `forbidden`
   *         when the policy denies.
   */
  async handle(input: FreezeAccountInput, ctx: ActionContext): Promise<FreezeAccountOutput> {
    const account = await this.accounts.findOneOrFail({ id: input.accountId });
    await ctx.authorize(account);
    await this.accounts.setFrozen(account, input.isFrozen, ctx.now());
    return FreezeAccountOutput.create({ accountId: account.id, isFrozen: account.isFrozen });
  }
}
