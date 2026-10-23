/**
 * Stackra file contract:
 * Purpose: the order detail page: status, lines, totals with the extension-applied adjustments, and
 *          the cancel action when allowed. Renders the order the route's loader read and keeps it
 *          fresh through its hook.
 * Boundary: a class component bound to `OrderDetailRoute` by its file name, its props typed
 *           `RouteProps<typeof OrderDetailRoute>`. Cancel goes through the generated client: the
 *           declared confirmation, the Idempotency-Key and the success toast are the client
 *           hook's, not this page's. The status label is the enum's derived key and its tone the
 *           enum's meta.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 7 and 14, as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0080, ADR 0082, ADR 0139
 */
import { useDateTime, useMoney, useTranslation } from "@stackra/i18n/react";
import type { RouteProps } from "@stackra/navigation/native";
import { Button, Card, Chip, ListGroup, Separator } from "@stackra/ui/native";
import { Component } from "#stackra/ui";
import { Enum } from "@stackra/contracts";
import { Fragment } from "react";
import { Text } from "react-native";
import { Screen } from "#src/components/screen";
import { ScreenState } from "#src/components/screen-state";
import type { OrderDetailRoute } from "#src/routes/order-detail/order-detail.route";
import { useOrderDetail } from "#src/routes/order-detail/use-order-detail";
import { OrderStatus } from "#stackra/clients/commerce";
import { I18n } from "#stackra/i18n";

/** The detail; `params.orderId` is validated by `OrderDetailParams` before the loader runs. */
export class OrderDetail extends Component<RouteProps<typeof OrderDetailRoute>> {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** Formats minor units in a currency for the active locale. */
  money = useMoney();

  /** Formats a date and time for the active locale. */
  dateTime = useDateTime();

  /** The live order and its cancel. */
  detail = useOrderDetail(this.props.params.orderId);

  /** The state while the order is missing, else its card, lines, totals and the cancel. */
  render() {
    const { t } = this.i18n;
    const { order, error, refresh, canCancel, cancel, isCancelling } = this.detail;

    if (!order)
      return (
        <Screen>
          {error ? (
            <ScreenState kind="error" error={error} onRetry={refresh} />
          ) : (
            <ScreenState kind="loading" />
          )}
        </Screen>
      );

    const currency = order.totals.currency;
    const total = this.money(order.totals.totalMinor, currency);
    return (
      <Screen testID="order-detail-page" onRefresh={refresh}>
        <Card>
          <Card.Body className="gap-2">
            <Card.Title>{order.id}</Card.Title>
            <Card.Description>
              {t(I18n.pages.order_detail.placed_at, {
                at: this.dateTime(order.createdAt, { dateStyle: "long", timeStyle: "short" }),
              })}
            </Card.Description>
            <Chip
              size="sm"
              variant="soft"
              color={Enum.meta(OrderStatus, order.status).tone}
              className="self-start"
            >
              <Chip.Label>{t(I18n.orders.enums.order_status[order.status])}</Chip.Label>
            </Chip>
          </Card.Body>
        </Card>

        <ListGroup accessibilityLabel={t(I18n.pages.order_detail.lines)}>
          {order.lines.map((line, i) => (
            <Fragment key={line.variantId}>
              {i > 0 ? <Separator className="mx-4" /> : null}
              <ListGroup.Item>
                <ListGroup.ItemContent>
                  <ListGroup.ItemTitle>{line.variantId}</ListGroup.ItemTitle>
                  <ListGroup.ItemDescription>
                    {`${line.quantity} × ${this.money(line.unitPriceMinor, currency)}`}
                  </ListGroup.ItemDescription>
                </ListGroup.ItemContent>
              </ListGroup.Item>
            </Fragment>
          ))}
        </ListGroup>

        <Card>
          <Card.Body className="gap-1">
            {order.totals.adjustments.map((a) => (
              <Text key={a.code} className="text-ink-muted">
                {`${a.label}: ${this.money(a.amountMinor, currency)}`}
              </Text>
            ))}
            <Text className="text-xl font-semibold text-ink">
              {`${t(I18n.pages.order_detail.total)}: ${total}`}
            </Text>
          </Card.Body>
        </Card>

        {canCancel ? (
          <Button
            variant="danger-soft"
            onPress={cancel}
            isDisabled={isCancelling}
            testID="order-cancel"
          >
            {t(I18n.pages.order_detail.cancel)}
          </Button>
        ) : null}
      </Screen>
    );
  }
}
