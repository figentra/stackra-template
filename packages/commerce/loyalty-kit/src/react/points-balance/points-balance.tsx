/**
 * Stackra file contract:
 * Purpose: the renderer of PointsBalanceWidget: tier, balance and the expiry warning on the
 *          customer's "My points" page.
 * Boundary: presentation only on @stackra/ui, bound to the Custom widget by its name; an app may
 *           override it in `src/overrides/loyalty_kit/points-balance.override.tsx`. The data is the
 *           balance query's own output (`BalanceView`, from core, since ./react never imports
 *           ./node). No business logic: the redeem form is a separate block. A function, never a
 *           class.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 7 and 15), ADR 0165 (HeroUI through @stackra/ui),
 *                     ADR 0080 (typed i18n keys)
 */
import { useTranslation } from "@stackra/i18n/react";
import { Card, Stat, Text } from "@stackra/ui";
import { I18n } from "#stackra/i18n";
import type { BalanceView } from "#core/schemas/balance-view.schema";
import { usePointsBalance } from "#react/points-balance/use-points-balance";

/** What the panel hands the renderer. */
export interface PointsBalanceProps {
  /** The bound query's output; undefined while loading. */
  readonly data?: BalanceView;

  /** True while the panel refreshes the widget. */
  readonly isRefreshing: boolean;
}

/**
 * Shows the balance with a warning when points expire within thirty days; the tier badge takes its
 * label from the enum's i18n keys.
 */
export function PointsBalance({ data, isRefreshing }: PointsBalanceProps) {
  const { t } = useTranslation();
  const { expiresSoon } = usePointsBalance(data);
  return (
    <Card aria-busy={isRefreshing}>
      <Stat
        label={t(I18n.loyalty_kit.widgets.points_balance.title)}
        value={data?.balance ?? 0}
        badge={data && t(I18n.loyalty_kit.enums.loyalty_tier[data.tier])}
      />
      {expiresSoon && <Text tone="warning">{t(I18n.loyalty_kit.overview.expiry_note)}</Text>}
    </Card>
  );
}
