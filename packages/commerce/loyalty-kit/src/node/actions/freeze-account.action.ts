/**
 * Stackra file contract:
 * Purpose: `loyalty_kit.account.freeze@1`: freeze or unfreeze an account for review. A row and bulk
 *          action of the account resource, so the console shows its confirmation and success
 *          message.
 * Boundary: single aggregate, inline. Its permission is L2, so a person confirms it first and an
 *           agent may call it only as the opted-in tool; LoyaltyAccountPolicy#freeze refines it
 *           through `ctx.authorize(account)`. The template's path is kept, so the endpoint is
 *           written. The confirmation and success texts are the derived i18n keys
 *           `loyalty_kit::actions.account.freeze.confirm` and `.success`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 2, 3, 16 and 21), ADR 0098, ADR 0139
 */
import { Action, type ActionContext, UxAfter } from "@stackra/actions";
import { ActorKind, HttpMethod, type PublicId, Tone } from "@stackra/contracts";
import { Schema } from "@stackra/validation";
import { LoyaltyAccountPermissions } from "#node/access/loyalty-account.permissions";
import type { AccountService } from "#node/services/account.service";

/** Which account and which way; freezing is the default direction. */
export class FreezeAccountInput extends Schema {
  /** The account's public id; the path parameter. */
  accountId!: PublicId<"lac">;

  /** True freezes, false unfreezes. */
  isFrozen = true;
}

/** The account and whether it is frozen now. */
export class FreezeAccountOutput extends Schema {
  /** The account's public id. */
  accountId!: PublicId<"lac">;

  /** The flag after the call. */
  isFrozen!: boolean;
}

/** Idempotent (PUT): freezing a frozen account changes nothing and records nothing. */
export class FreezeAccountAction extends Action({
  key: "account.freeze",
  permission: LoyaltyAccountPermissions.freeze,
  actors: [ActorKind.User, ActorKind.Agent],
  tool: true,
  endpoint: {
    method: HttpMethod.Put,
    path: "/loyalty/accounts/:accountId/freeze",
  },
  ux: {
    confirm: Tone.Warning,
    after: [UxAfter.Refresh],
  },
}) {
  /** @param accounts - loads the account and flips the flag. */
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
