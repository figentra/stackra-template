/**
 * Stackra file contract:
 * Purpose: one order in the list: public id, status chip, total in the order's currency, placement
 *          time; a press opens it and a long press shows `OrderCardMenu`.
 * Boundary: presentation; `onPress` is the only behaviour of its own, the context menu is a
 *           declared menu. Money and dates are formatted by the i18n hooks, never by hand. The
 *           status is one of the producer's enum codes: its label is the derived key
 *           `orders::enums.order_status.<code>` and its tone the enum's meta, so a new status ships
 *           its own label and tone and this file does not change.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 14), ADR 0080, ADR 0082
 */
import type { QueryOutput } from "@stackra/clients";
import { useDateTime, useMoney, useTranslation } from "@stackra/i18n/react";
import { ContextMenu } from "@stackra/navigation/native";
import { Card, Chip, PressableFeedback } from "@stackra/ui/native";
import { Enum } from "@stackra/validation";
import { Text, View } from "react-native";
import { OrderCardMenu } from "#src/menus/order-card.menu";
import { type Commerce, OrderStatus } from "#stackra/clients";
import { I18n } from "#stackra/i18n";

/** Props of {@link OrderCard}. */
export interface OrderCardProps {
  /** The order as `Commerce.queries.ListOrders` returns it. */
  readonly order: QueryOutput<typeof Commerce.queries.GetOrder>;
  /** Opens the detail; receives the public id. */
  readonly onPress: (orderId: string) => void;
}

/** The card. Accessible as a button whose label is the id and the status. */
export function OrderCard({ order, onPress }: OrderCardProps) {
  const { t } = useTranslation();
  const money = useMoney();
  const dateTime = useDateTime();
  const label = t(I18n.orders.enums.order_status[order.status]);
  return (
    <ContextMenu menu={OrderCardMenu} value={order}>
      <PressableFeedback
        onPress={() => onPress(order.id)}
        accessibilityRole="button"
        accessibilityLabel={`${order.id}, ${label}`}
        testID={`order-${order.id}`}
      >
        <Card>
          <Card.Body className="flex-row items-center justify-between gap-3">
            <View className="gap-1">
              <Card.Title>{order.id}</Card.Title>
              <Card.Description>
                {dateTime(order.createdAt, { dateStyle: "medium", timeStyle: "short" })}
              </Card.Description>
            </View>
            <View className="items-end gap-1">
              <Text className="font-semibold text-ink">
                {money(order.totals.totalMinor, order.totals.currency)}
              </Text>
              <Chip size="sm" variant="soft" color={Enum.meta(OrderStatus, order.status).tone}>
                <Chip.Label>{label}</Chip.Label>
              </Chip>
            </View>
          </Card.Body>
        </Card>
      </PressableFeedback>
    </ContextMenu>
  );
}
