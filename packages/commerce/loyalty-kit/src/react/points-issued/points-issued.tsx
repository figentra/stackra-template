/**
 * Stackra file contract:
 * Purpose: the dashboard tile with today's points earned and redeemed, rendered by
 *          `PointsIssuedWidget`.
 * Boundary: presentation only on @stackra/ui; props are typed from the `PointsIssuedTile` override
 *           point, whose data is the points-issued query's own output. No business logic. A
 *           component is a folder and stays a function; the `@Override` class in react/overrides
 *           registers it for the point.
 * Runtime: browser
 * Governing contract: ADR 0128 decision 2, ADR 0165 (HeroUI through @stackra/ui), ADR 0080 (typed
 *                     i18n keys)
 */
import { Card, Stat } from "@stackra/ui";
import { useTranslation } from "@stackra/i18n/react";
import type { OverrideComponent } from "@stackra/panel";
import { I18n } from "#stackra/i18n";
import type { PointsIssuedTile } from "#core/override-points/points-issued-tile.point";

/**
 * Shows points earned today as the headline and points redeemed as the badge; zeros while loading.
 */
export const PointsIssued: OverrideComponent<typeof PointsIssuedTile> = ({
  data,
  isRefreshing,
}) => {
  const { t } = useTranslation();
  return (
    <Card aria-busy={isRefreshing}>
      <Stat
        label={t(I18n.loyalty_kit.widgets.points_issued)}
        value={data?.earned ?? 0}
        badge={`−${data?.redeemed ?? 0}`}
      />
    </Card>
  );
};
