/**
 * Stackra file contract:
 * Purpose: `loyalty_kit.account.enroll`: enroll a principal (staff) or oneself (customer). The
 *          plain "call" action: inline handle(), one transaction, reachable over HTTP, as an MCP
 *          tool, and through a host's generated client.
 * Boundary: the action is the contract (key, schemas, permission, actors, UX); its risk is the
 *           permission's, and AccountService does the work. No `@1` in the key: version 1 until
 *           `@Version` says otherwise.
 * Runtime: node
 * Governing contract: ADR 0098, 0136, 0139 (declared UX), 0155 (tool exposure is opt-in with
 *                     @AsTool)
 */
import { Action, AsEndpoint, AsTool, UxAfter, type ActionContext } from "@stackra/actions";
import { ActorKind, HttpMethod, Realm } from "@stackra/contracts";
import { I18n } from "#stackra/i18n";
import { memberId } from "#core/functions/member-id.function";
import { NotOwnPrincipalError } from "#core/errors/not-own-principal.error";
import { EnrollMemberInput } from "#core/schemas/enroll-member-input.schema";
import { EnrollMemberOutput } from "#core/schemas/enroll-member-output.schema";
import { AccountService } from "#node/services/account.service";
import { LoyaltyAccountPermissions } from "#node/permissions/loyalty-account.permission";

/**
 * Creates the account at the address the client names; a second call for the same principal returns
 * the existing account (idempotent by nature, so PUT). The principal is read from the body, never
 * from the path.
 */
@Action({
  key: "account.enroll", // gen prefixes the module key: `loyalty_kit.account.enroll`
  input: EnrollMemberInput,
  output: EnrollMemberOutput,
  permission: LoyaltyAccountPermissions.enroll,
  actors: [ActorKind.User, ActorKind.Agent, ActorKind.Service],
  intents: ["enroll this customer in loyalty", "add them to the points programme"],
  ux: { success: I18n.loyalty_kit.account.enrolled, after: [UxAfter.Refresh] },
})
@AsEndpoint({ method: HttpMethod.Put, path: "/loyalty/accounts/:accountId" })
@AsTool()
export class EnrollMemberAction {
  constructor(private readonly accounts: AccountService) {}

  /**
   * A customer may only enroll themselves; the check is here, not in a policy, because no record
   * exists yet.
   * @throws NotOwnPrincipalError for a customer naming someone else.
   */
  async handle(input: EnrollMemberInput, ctx: ActionContext): Promise<EnrollMemberOutput> {
    if (ctx.actor.realm === Realm.Customer && input.principalId !== ctx.actor.id)
      throw new NotOwnPrincipalError();
    const account = await this.accounts.enroll(
      memberId(input.principalId),
      input.tier,
      input.accountId,
    );
    return { accountId: account.id, tier: account.tier };
  }
}
