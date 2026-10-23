/**
 * Stackra file contract:
 * Purpose: the web renderer of PointsBalanceWidget: tier, balance and the expiry warning on the
 *          customer's "My points" dashboard.
 * Boundary: a class component on @stackra/ui (HeroUI v3), bound to the Custom widget by its name;
 *           gen compiles the class to a function component. Fields are state (`now`, read once at
 *           mount), a field that calls a hook is a read-only hook field (`i18n`), a getter is a
 *           derived value. No business logic: the warning rule is `isExpiringSoon` in core, shared
 *           with the native renderer. An app shadows this file under
 *           `src/overrides/@acme/loyalty-kit/src/react/points-balance/points-balance.tsx`, keeping
 *           the name and PointsBalanceProps.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 7 and 15, as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0165 (HeroUI through @stackra/ui),
 *                     ADR 0080 (typed i18n keys)
 */
import { useTranslation } from "@stackra/i18n/react";
import { Card, Stat, Text } from "@stackra/ui/react";
import { Component } from "#stackra/ui";
import { I18n } from "#stackra/i18n";
import { isExpiringSoon } from "#core/functions/is-expiring-soon.function";
import type { PointsBalanceProps } from "#react/points-balance/points-balance.props";

/**
 * Shows the balance with a warning when points expire within thirty days; the tier badge takes its
 * label from the enum's i18n keys.
 */
export class PointsBalance extends Component<PointsBalanceProps> {
  /** The clock, read once when the tile mounts: a thirty-day window needs no ticking time. */
  now = Date.now();

  /** The translator of the active locale. */
  i18n = useTranslation();

  /** True when the oldest live points expire within thirty days of mounting. */
  get hasExpiryWarning(): boolean {
    return isExpiringSoon(this.props.data?.nextExpiryAt, this.now);
  }

  /** The card: the balance as the headline, the tier as its badge, the warning below. */
  render() {
    const { data, isRefreshing } = this.props;
    const { t } = this.i18n;
    return (
      <Card aria-busy={isRefreshing}>
        <Stat
          label={t(I18n.loyalty_kit.widgets.points_balance.title)}
          value={data?.balance ?? 0}
          badge={data && t(I18n.loyalty_kit.enums.loyalty_tier[data.tier])}
        />
        {this.hasExpiryWarning && (
          <Text tone="warning">{t(I18n.loyalty_kit.widgets.points_balance.expiry_note)}</Text>
        )}
      </Card>
    );
  }
}
