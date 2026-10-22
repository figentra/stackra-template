/**
 * Stackra file contract:
 * Purpose: `loyalty_kit.points.balance`: an account's balance, tier and next expiry. L0 (its
 *          permission's risk), so also an MCP tool automatically.
 * Boundary: read only, no transaction; cached per member for one minute, dropped the moment points
 *           move (class references in `invalidateOn`, no tags typed by hand).
 * Runtime: node
 * Governing contract: ADR 0137 (cache option), 0150, 0155
 */
import { AsEndpoint, Query, type QueryContext } from "@stackra/actions";
import { ActorKind, HttpMethod } from "@stackra/contracts";
import type { SettingsReader } from "@stackra/settings";
import type { LoyaltyLedger } from "#contracts/loyalty-ledger.port";
import { EntryKind } from "#core/enums/entry-kind.enum";
import { memberId } from "#core/functions/member-id.function";
import { BalanceView } from "#core/schemas/balance-view.schema";
import { GetBalanceInput } from "#core/schemas/get-balance-input.schema";
import type { AccountService } from "#node/services/account.service";
import { PointsEarned } from "#node/events/points-earned.event";
import { PointsRedeemed } from "#node/events/points-redeemed.event";
import { LoyaltyAccountPermissions } from "#node/permissions/loyalty-account.permission";
import { LoyaltySettings } from "#node/settings/loyalty.setting";

/**
 * `cache.key` scopes the entry per account, so one member's redemption never evicts everyone's
 * balance.
 */
@Query({
  key: "points.balance",
  input: GetBalanceInput,
  output: BalanceView,
  permission: LoyaltyAccountPermissions.read,
  actors: [ActorKind.User, ActorKind.Agent, ActorKind.Service],
  intents: ["how many points do I have", "show my loyalty balance"],
  description:
    "Returns the caller's (or, for staff, any member's) points balance, tier and the date the " +
    "oldest points expire.",
  cache: {
    ttl: "1m",
    key: (input) => input.accountId,
    invalidateOn: [PointsEarned, PointsRedeemed],
  },
})
@AsEndpoint({ method: HttpMethod.Get, path: "/loyalty/accounts/:accountId/balance" })
export class GetBalanceQuery {
  constructor(
    private readonly accounts: AccountService,
    private readonly ledger: LoyaltyLedger,
    private readonly settings: SettingsReader,
  ) {}

  /**
   * Loads the account first so the policy can see it; the balance is read after authorization
   * passes.
   * @throws a `NotFound` refusal when the account does not exist in this tenant.
   * @throws a `Forbidden` refusal when LoyaltyAccountPolicy.read denies a customer another
   * member's account.
   */
  async handle(input: GetBalanceInput, ctx: QueryContext): Promise<BalanceView> {
    const account = await this.accounts.findOneOrFail(
      { id: input.accountId },
      { populate: ["entries"] },
    );
    await ctx.authorize(LoyaltyAccountPermissions.read, account);
    const { expiryMonths } = await this.settings.for(LoyaltySettings);
    const oldestEarn = account.entries
      .filter((e) => e.kind.is(EntryKind.Earn))
      .map((e) => e.at)
      .sort((a, b) => a.getTime() - b.getTime())[0];
    const nextExpiry = oldestEarn
      ? new Date(
          Date.UTC(
            oldestEarn.getUTCFullYear(),
            oldestEarn.getUTCMonth() + expiryMonths,
            oldestEarn.getUTCDate(),
          ),
        )
      : null;
    return {
      memberId: account.memberId,
      tier: account.tier,
      balance: await this.ledger.balance(memberId(account.memberId)),
      nextExpiryAt: nextExpiry?.toISOString() ?? null,
    };
  }
}
