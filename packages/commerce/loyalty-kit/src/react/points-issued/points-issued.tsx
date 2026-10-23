/**
 * Stackra file contract:
 * Purpose: the web renderer of PointsIssuedWidget: today's points earned and redeemed on the
 *          dashboard.
 * Boundary: a class component on @stackra/ui (HeroUI v3), bound to the Custom widget by its name;
 *           gen compiles the class to a function component. Presentation only: the data is the
 *           points-issued query's own output. An app shadows this file under
 *           `src/overrides/@acme/loyalty-kit/src/react/points-issued/points-issued.tsx`, keeping
 *           the name and PointsIssuedProps.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 7 and 15, as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0165 (HeroUI through @stackra/ui),
 *                     ADR 0080 (typed i18n keys)
 */
import { useTranslation } from "@stackra/i18n/react";
import { Card, Component, Stat } from "@stackra/ui";
import { I18n } from "#stackra/i18n";
import type { PointsIssuedProps } from "#react/points-issued/points-issued.props";

/**
 * Shows points earned today as the headline and points redeemed as the badge; zeros while loading.
 */
export class PointsIssued extends Component<PointsIssuedProps> {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** The card: earned as the value, redeemed as a negative badge. */
  render() {
    const { data, isRefreshing } = this.props;
    const { t } = this.i18n;
    return (
      <Card aria-busy={isRefreshing}>
        <Stat
          label={t(I18n.loyalty_kit.widgets.points_issued.title)}
          value={data?.earned ?? 0}
          badge={`−${data?.redeemed ?? 0}`}
        />
      </Card>
    );
  }
}
