/**
 * Stackra file contract:
 * Purpose: today's revenue and an hourly sparkline: the native tile for the orders module's
 *          revenue-today widget, the twin of the console's component.
 * Boundary: presentation only; props are typed from the override point's props schema
 *           (`Commerce.overrides.RevenueSparkline`), bound in `overrides/orders/components/`. No
 *           fetching here.
 * Runtime: react-native
 * Governing contract: ADR 0112, ADR 0164
 */
import { useMoney, useTranslation } from "@stackra/i18n/react";
import type { OverrideComponent } from "@stackra/panel";
import { Sparkline } from "@stackra/ui/native";
import { Card } from "@stackra/ui/native";
import { Text } from "react-native";
import type { Commerce } from "#stackra/clients";
import { I18n } from "#stackra/i18n";

/**
 * Props the panel passes: the bound query's output (`Commerce.queries.OrdersToday`), already
 * fetched and refreshed.
 */
export type RevenueSparklineProps = Parameters<
  OverrideComponent<typeof Commerce.overrides.RevenueSparkline>
>[0];

/**
 * The tile body: the day's revenue in the order currency, and a decorative sparkline hidden from
 * assistive tech.
 */
export const RevenueSparkline: OverrideComponent<typeof Commerce.overrides.RevenueSparkline> = ({
  data,
}) => {
  const { t } = useTranslation();
  const money = useMoney();
  return (
    <Card accessibilityLabel={t(I18n.orders.widgets.revenue_today)}>
      <Card.Header>
        <Card.Title>{t(I18n.orders.widgets.revenue_today)}</Card.Title>
      </Card.Header>
      <Card.Body className="gap-2">
        <Text className="text-2xl font-semibold text-ink">
          {money(data.revenueMinor, data.currency)}
        </Text>
        <Sparkline
          values={data.hourly}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      </Card.Body>
    </Card>
  );
};
