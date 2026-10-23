/**
 * Stackra file contract:
 * Purpose: promotes an account when the balance after an earn crosses a tier threshold.
 * Boundary: subscribed to the kit's own `loyalty_kit.points.earned` by the type of the event
 *           parameter; runs after commit, in its own transaction, once per event id. Idempotent:
 *           it only ever raises a tier, so a redelivery or a lower balance changes nothing. One
 *           listener is one reaction with one `handle`: a second reaction to the same event is a
 *           second listener file, never a second method here, so each retries and fails alone.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4 and 16), ADR 0078 d4 (listener semantics)
 */
import { Listener, type ListenerContext } from "@stackra/events";
import type { SettingsReader } from "@stackra/settings";
import { Enum } from "@stackra/contracts";
import { LoyaltyTier } from "#contracts/enums/loyalty-tier.enum";
import type { PointsEarned } from "#node/events/points-earned.event";
import { LoyaltyKitSettings } from "#node/loyalty-kit.settings";
import type { AccountService } from "#node/services/account.service";

/** Reads the v2 payload's `balanceAfter`, which is why the event gained a version. */
export class RecalculateTierListener extends Listener {
  /**
   * @param accounts - loads the account to promote.
   * @param settings - the tenant's tier thresholds, read per event so a change applies at once.
   */
  constructor(
    private readonly accounts: AccountService,
    private readonly settings: SettingsReader,
  ) {
    super();
  }

  /** Promotion only; demotion is a tenant decision made in the console, never automatic. */
  async handle(event: PointsEarned, _ctx: ListenerContext): Promise<void> {
    const { tiers } = await this.settings.get(LoyaltyKitSettings);
    const { silverFrom, goldFrom } = tiers;
    const target =
      event.balanceAfter >= goldFrom
        ? LoyaltyTier.Gold
        : event.balanceAfter >= silverFrom
          ? LoyaltyTier.Silver
          : LoyaltyTier.Bronze;
    const account = await this.accounts.findOneOrFail({ memberId: event.memberId });
    const ranks = Enum.values(LoyaltyTier); // lowest first
    if (ranks.indexOf(target) > ranks.indexOf(account.tier)) account.tier = target;
  }
}
