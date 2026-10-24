/**
 * Stackra file contract:
 * Purpose: one order in the list: public id, status chip, total in the order's currency, placement
 *          time; a press opens it and a long press shows `OrderCardMenu`.
 * Boundary: a presentational class component; `onPress` is the only behaviour of its own, the
 *           context menu is a declared menu. Money and dates are formatted by the i18n hooks, never
 *           by hand. The status is one of the producer's enum codes: its label is the derived key
 *           `orders::enums.order_status.<code>` and its tone the enum's meta, so a new status ships
 *           its own label and tone and this file does not change.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 14, as amended by programming model v3.1, AGENTS.md: class
 *                     components), ADR 0080, ADR 0082
 */
import { useDateTime, useMoney, useTranslation } from "@stackra/i18n/react";
import { ContextMenu } from "@stackra/navigation/native";
import { Card, Chip, PressableFeedback } from "@stackra/ui/native";
import { Component } from "#stackra/ui";
import { Enum } from "@stackra/contracts";
import { Text, View } from "react-native";
import type { OrderCardProps } from "#src/components/order-card/order-card.props";
import { OrderCardMenu } from "#src/menus/order-card.menu";
import { OrderStatus } from "#stackra/clients/commerce";
import { I18n } from "#stackra/i18n";

/**
 * The card. Accessible as a button whose label is the id and the status.
 */
export class OrderCard extends Component<OrderCardProps> {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** Formats minor units in a currency for the active locale. */
  money = useMoney();

  /** Formats a date and time for the active locale. */
  dateTime = useDateTime();

  /** The status label, translated from the producer's enum key. */
  get statusLabel() {
    return this.i18n.t(I18n.orders.enums.order_status[this.props.order.status]);
  }

  /** The pressable card inside the context menu. */
  render() {
    const { order, onPress } = this.props;
    return (
      <ContextMenu menu={OrderCardMenu} value={order}>
        <PressableFeedback
          onPress={() => onPress(order.id)}
          accessibilityRole="button"
          accessibilityLabel={`${order.id}, ${this.statusLabel}`}
          testID={`order-${order.id}`}
        >
          <Card>
            <Card.Body className="flex-row items-center justify-between gap-3">
              <View className="gap-1">
                <Card.Title>{order.id}</Card.Title>
                <Card.Description>
                  {this.dateTime(order.createdAt, { dateStyle: "medium", timeStyle: "short" })}
                </Card.Description>
              </View>
              <View className="items-end gap-1">
                <Text className="font-semibold text-ink">
                  {this.money(order.totals.totalMinor, order.totals.currency)}
                </Text>
                <Chip size="sm" variant="soft" color={Enum.meta(OrderStatus, order.status).tone}>
                  <Chip.Label>{this.statusLabel}</Chip.Label>
                </Chip>
              </View>
            </Card.Body>
          </Card>
        </PressableFeedback>
      </ContextMenu>
    );
  }
}
