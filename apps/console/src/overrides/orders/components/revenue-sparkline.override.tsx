/**
 * Stackra file contract:
 * Purpose: the component commerce's revenue-today widget requires (`RevenueSparkline` is a
 *          `required: true` override point, so a consuming app must register one): today's revenue
 *          in the order currency and a decorative hourly sparkline.
 * Boundary: presentation only; props are the widget query's output, typed from the override point.
 *           No fetching.
 * Runtime: browser
 * Governing contract: ADR 0164, ADR 0234 d9 (overrides/)
 */
import { Override, type OverrideComponent } from "@stackra/panel";
import { Card, Sparkline } from "@stackra/ui";
import { useMoney, useTranslation } from "@stackra/i18n/react";
import { Commerce } from "#stackra/clients";
import { I18n } from "#stackra/i18n";

/**
 * The tile body; the sparkline is hidden from assistive tech, the money is the accessible value.
 */
const RevenueSparkline: OverrideComponent<typeof Commerce.overrides.RevenueSparkline> = ({
  revenueMinor,
  currency,
  hourly,
}) => {
  const { t } = useTranslation();
  const money = useMoney();
  return (
    <Card aria-label={t(I18n.orders.widgets.revenue_today)}>
      <Card.Header>{t(I18n.orders.widgets.revenue_today)}</Card.Header>
      <Card.Content>
        <strong>{money(revenueMinor, currency)}</strong>
        <Sparkline values={hourly} aria-hidden />
      </Card.Content>
    </Card>
  );
};

/**
 * Console implementation of the required `RevenueSparkline` override of commerce's revenue-today
 * widget.
 */
@Override(Commerce.overrides.RevenueSparkline, { component: RevenueSparkline })
export class RevenueSparklineOverride {}
