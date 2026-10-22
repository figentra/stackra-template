/**
 * Stackra file contract:
 * Purpose: promotes an account when the balance after an earn crosses a tier threshold.
 * Boundary: in-process listener on the kit's own event, after commit, in its own transaction;
 *           idempotent (setting the same tier is a no-op). `@OnEvent` takes the event class, so the
 *           payload is typed.
 * Runtime: node
 * Governing contract: ADR 0264 decision 8 (one listener form), ADR 0078
 */
import { OnEvent, type ListenerContext } from "@stackra/events";
import type { SettingsReader } from "@stackra/settings";
import { LoyaltyTier } from "#core/enums/loyalty-tier.enum";
import type { AccountService } from "#node/services/account.service";
import { PointsEarned } from "#node/events/points-earned.event";
import { LoyaltySettings } from "#node/settings/loyalty.setting";

/** Reads the v2 payload's `balanceAfter`, which is why the event gained a version. */
export class RecalculateTierListener {
  constructor(
    private readonly accounts: AccountService,
    private readonly settings: SettingsReader,
  ) {}

  /** Promotion only; demotion is a tenant decision made in the console, never automatic. */
  @OnEvent(PointsEarned)
  async handle(event: PointsEarned, _ctx: ListenerContext): Promise<void> {
    const { silverFrom, goldFrom } = await this.settings.for(LoyaltySettings);
    const { balanceAfter } = event.data;
    const target =
      balanceAfter >= goldFrom
        ? LoyaltyTier.Gold
        : balanceAfter >= silverFrom
          ? LoyaltyTier.Silver
          : LoyaltyTier.Bronze;
    const account = await this.accounts.findOneOrFail({ memberId: event.data.memberId });
    if (!target.is(account.tier) && !target.is(LoyaltyTier.Bronze)) account.tier = target;
  }
}
