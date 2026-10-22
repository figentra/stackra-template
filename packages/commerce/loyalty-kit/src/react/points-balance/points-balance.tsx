/**
 * Stackra file contract:
 * Purpose: the balance tile: tier, balance and the expiry warning, rendered by the overview
 *          document.
 * Boundary: presentation only on @stackra/ui; props are typed from the override point in core. No
 *           business logic: the redeem form is a separate block. A component is a folder (ADR 0128
 *           decision 2) and stays a function; it is registered for the point by the `@Override`
 *           class in react/overrides.
 * Runtime: browser
 * Governing contract: ADR 0128 decision 2, ADR 0165 (HeroUI through @stackra/ui), ADR 0080 (typed
 *                     i18n keys)
 */
import { Card, Stat, Text } from "@stackra/ui";
import { useTranslation } from "@stackra/i18n/react";
import type { OverrideComponent } from "@stackra/panel";
import { I18n } from "#stackra/i18n";
import type { PointsBalanceTile } from "#core/override-points/points-balance.point";
import { usePointsBalance } from "#react/points-balance/use-points-balance";

/**
 * Shows the balance with a warning when points expire within thirty days; the tier badge takes its
 * label from the enum.
 */
export const PointsBalance: OverrideComponent<typeof PointsBalanceTile> = ({
  data,
  isRefreshing,
}) => {
  const { t } = useTranslation();
  const { expiresSoon } = usePointsBalance(data);
  return (
    <Card aria-busy={isRefreshing}>
      <Stat
        label={t(I18n.loyalty_kit.widgets.points_balance)}
        value={data?.balance ?? 0}
        badge={data && t(data.tier.label)}
      />
      {expiresSoon && <Text tone="warning">{t(I18n.loyalty_kit.documents.expiry_note)}</Text>}
    </Card>
  );
};
