/**
 * Stackra file contract:
 * Purpose: `loyalty_kit.account.enroll@1`: enroll a principal (staff) or oneself (customer). The
 *          plain "call" action: inline `handle`, one transaction, reachable over HTTP, as an MCP
 *          tool and through a host's generated client.
 * Boundary: the action is the contract: key, input and output (the types of `handle`),
 *           permission, actors and UX; its risk is the permission's, and AccountService does the
 *           work. The key's aggregate (`account`) is not the model's, so the permission is named;
 *           the template's path is kept, so the endpoint is written. The success toast is the
 *           derived i18n key `loyalty_kit::actions.account.enroll.success`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 2, 3, 16 and 21), ADR 0098, ADR 0136, ADR 0139 (declared
 *                     UX), ADR 0155
 */
import { Action, type ActionContext, UxAfter } from "@stackra/actions";
import { ActorKind, HttpMethod, type PublicId, Realm } from "@stackra/contracts";
import { Schema } from "@stackra/validation";
import type { LoyaltyTier } from "#contracts/enums/loyalty-tier.enum";
import { NotOwnPrincipalError } from "#core/errors/not-own-principal.error";
import { memberId } from "#core/functions/member-id.function";
import type { EnrollMemberInput } from "#core/schemas/enroll-member-input.schema";
import { LoyaltyAccountPermissions } from "#node/access/loyalty-account.permissions";
import type { AccountService } from "#node/services/account.service";

/** The account and its tier, whether it was just created or already existed. */
export class EnrollMemberOutput extends Schema {
  /** The account's public id. */
  accountId!: PublicId<"lac">;

  /** The account's tier. */
  tier!: LoyaltyTier;
}

/**
 * Creates the account at the address the client names; a second call for the same principal
 * returns the existing account (idempotent by nature, so PUT). The principal is read from the
 * body, never from the path.
 */
export class EnrollMemberAction extends Action({
  key: "account.enroll",
  permission: LoyaltyAccountPermissions.enroll,
  actors: [ActorKind.User, ActorKind.Agent, ActorKind.Service],
  tool: true,
  intents: ["enroll this customer in loyalty", "add them to the points programme"],
  endpoint: {
    method: HttpMethod.Put,
    path: "/loyalty/accounts/:accountId",
  },
  ux: { after: [UxAfter.Refresh] },
}) {
  /** @param accounts - creates the account and records `account.enrolled`. */
  constructor(private readonly accounts: AccountService) {
    super();
  }

  /**
   * A customer may only enroll themselves; the check is here, not in a policy, because no record
   * exists yet.
   * @throws NotOwnPrincipalError for a customer naming someone else.
   */
  async handle(input: EnrollMemberInput, ctx: ActionContext): Promise<EnrollMemberOutput> {
    if (ctx.actor.realm === Realm.Customer && input.principalId !== ctx.actor.id) {
      throw NotOwnPrincipalError.create();
    }
    const account = await this.accounts.enroll(
      memberId(input.principalId),
      input.tier,
      input.accountId,
    );
    return EnrollMemberOutput.create({ accountId: account.id, tier: account.tier });
  }
}
