/**
 * Stackra file contract:
 * Purpose: `loyalty_kit.points.balance@1`: an account's balance, tier and next expiry. L0 (its
 *          permission's risk), so also an MCP tool automatically.
 * Boundary: read only, no transaction. Cached for one minute per input (the account) and dropped
 *           the moment points move (`invalidateOn` takes the event classes). The key's aggregate
 *           (`points`) is not the model's, so the permission is named, and
 *           LoyaltyAccountPolicy#read narrows a customer to their own account through
 *           `ctx.authorize(account)`. The template's path is kept, so the endpoint is written.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 2, 16 and 21), ADR 0137 (cache option), ADR 0150,
 *                     ADR 0155
 */
import { Query, type QueryContext } from "@stackra/actions";
import { ActorKind, HttpMethod, type PublicId } from "@stackra/contracts";
import type { SettingsReader } from "@stackra/settings";
import { Schema } from "@stackra/validation";
import { EntryKind } from "#contracts/enums/entry-kind.enum";
import type { LoyaltyLedger } from "#contracts/ports/loyalty-ledger.port";
import { memberId } from "#core/functions/member-id.function";
import { BalanceView } from "#core/schemas/balance-view.schema";
import { LoyaltyAccountPermissions } from "#node/access/loyalty-account.permissions";
import { PointsEarned } from "#node/events/points-earned.event";
import { PointsRedeemed } from "#node/events/points-redeemed.event";
import { LoyaltyKitSettings } from "#node/loyalty-kit.settings";
import type { AccountService } from "#node/services/account.service";

/** Whose balance; a customer may only pass their own account. */
export class GetBalanceInput extends Schema {
  /** The account's public id; the path parameter of every loyalty account route. */
  accountId!: PublicId<"lac">;
}

/**
 * Returns the caller's (or, for staff, any member's) points balance, tier and the date the oldest
 * points expire; behind the points-balance widget and agents' balance questions.
 */
export class GetBalanceQuery extends Query({
  key: "points.balance",
  permission: LoyaltyAccountPermissions.read,
  actors: [ActorKind.User, ActorKind.Agent, ActorKind.Service],
  intents: ["how many points do I have", "show my loyalty balance"],
  cache: {
    ttl: "1m",
    invalidateOn: [PointsEarned, PointsRedeemed],
  },
  endpoint: {
    method: HttpMethod.Get,
    path: "/loyalty/accounts/:accountId/balance",
  },
}) {
  /**
   * @param accounts - loads the account for the policy.
   * @param ledger - the configured ledger driver; the balance is its sum.
   * @param settings - the tenant's expiry window, for the next expiry date.
   */
  constructor(
    private readonly accounts: AccountService,
    private readonly ledger: LoyaltyLedger,
    private readonly settings: SettingsReader,
  ) {
    super();
  }

  /**
   * Loads the account first so the policy can see it; the balance is read after authorization
   * passes.
   * @throws Refusal `not_found` when the account does not exist in this tenant; `forbidden` when
   *         LoyaltyAccountPolicy#read denies a customer another member's account.
   */
  async handle(input: GetBalanceInput, ctx: QueryContext): Promise<BalanceView> {
    const account = await this.accounts.findOneOrFail(
      { id: input.accountId },
      { populate: ["entries"] },
    );
    await ctx.authorize(account);
    const { expiryMonths } = await this.settings.for(LoyaltyKitSettings);
    const oldestEarn = account.entries
      .filter((entry) => entry.kind === EntryKind.Earn)
      .map((entry) => entry.at)
      .sort((a, b) => a.getTime() - b.getTime())[0];
    const nextExpiryAt = oldestEarn
      ? new Date(
          Date.UTC(
            oldestEarn.getUTCFullYear(),
            oldestEarn.getUTCMonth() + expiryMonths,
            oldestEarn.getUTCDate(),
          ),
        )
      : null;
    return BalanceView.create({
      memberId: account.memberId,
      tier: account.tier,
      balance: await this.ledger.balance(memberId(account.memberId)),
      nextExpiryAt,
    });
  }
}
