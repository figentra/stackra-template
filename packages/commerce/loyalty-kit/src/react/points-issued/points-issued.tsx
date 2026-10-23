/**
 * Stackra file contract:
 * Purpose: the renderer of PointsIssuedWidget: today's points earned and redeemed on the
 *          dashboard.
 * Boundary: presentation only on @stackra/ui, bound to the Custom widget by its name; an app may
 *           override it in `src/overrides/loyalty_kit/points-issued.override.tsx`. The data is the
 *           points-issued query's own output (`PointsIssuedView`, from core, since ./react never
 *           imports ./node). No business logic. A function, never a class.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 7 and 15), ADR 0165 (HeroUI through @stackra/ui),
 *                     ADR 0080 (typed i18n keys)
 */
import { useTranslation } from "@stackra/i18n/react";
import { Card, Stat } from "@stackra/ui";
import { I18n } from "#stackra/i18n";
import type { PointsIssuedView } from "#core/schemas/points-issued-view.schema";

/** What the panel hands the renderer. */
export interface PointsIssuedProps {
  /** The bound query's output; undefined while loading. */
  readonly data?: PointsIssuedView;

  /** True while the panel refreshes after a `refreshOn` event. */
  readonly isRefreshing: boolean;
}

/**
 * Shows points earned today as the headline and points redeemed as the badge; zeros while loading.
 */
export function PointsIssued({ data, isRefreshing }: PointsIssuedProps) {
  const { t } = useTranslation();
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
