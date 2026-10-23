/**
 * Stackra file contract:
 * Purpose: the native renderer of PointsBalanceWidget: tier, balance and the expiry warning in the
 *          mobile app's "My points" screen.
 * Boundary: a class component on @stackra/ui/native, the HeroUI Native implementation of the same
 *           Card, Stat and Text contract the web renderer uses, styled by the Uniwind theme; gen
 *           compiles the class to a function component, as on the web. It mirrors the web class
 *           member for member and shares only core: the warning rule (`isExpiringSoon`) and the
 *           data shape. An app shadows it under
 *           `src/overrides/@acme/loyalty-kit/src/native/points-balance/points-balance.tsx`.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 7 and 15, as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0165 (HeroUI Native through
 *                     @stackra/ui/native), ADR 0302, ADR 0080 (typed i18n keys)
 */
import { useTranslation } from "@stackra/i18n/react";
import { Card, Component, Stat, Text } from "@stackra/ui/native";
import { I18n } from "#stackra/i18n";
import { isExpiringSoon } from "#core/functions/is-expiring-soon.function";
import type { PointsBalanceProps } from "#native/points-balance/points-balance.props";

/**
 * Shows the balance with a warning when points expire within thirty days; the card announces
 * itself busy to screen readers while the host refreshes it.
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
      <Card accessibilityState={{ busy: isRefreshing }}>
        <Card.Body className="gap-2">
          <Stat
            label={t(I18n.loyalty_kit.widgets.points_balance.title)}
            value={data?.balance ?? 0}
            badge={data && t(I18n.loyalty_kit.enums.loyalty_tier[data.tier])}
          />
          {this.hasExpiryWarning && (
            <Text tone="warning">{t(I18n.loyalty_kit.widgets.points_balance.expiry_note)}</Text>
          )}
        </Card.Body>
      </Card>
    );
  }
}
