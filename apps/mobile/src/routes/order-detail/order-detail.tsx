/**
 * Stackra file contract:
 * Purpose: the order detail page: status, lines, totals with the extension-applied adjustments, and
 *          the cancel action when allowed. Renders the order the route's loader read and keeps it
 *          fresh through its hook.
 * Boundary: a function component bound to `OrderDetailRoute` by its file name. Cancel goes through
 *           the generated client: the declared confirmation, the Idempotency-Key and the success
 *           toast are the client hook's, not this page's. The status label is the enum's derived
 *           key and its tone the enum's meta.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 7 and 14), ADR 0080, ADR 0082, ADR 0139
 */
import { useDateTime, useMoney, useTranslation } from "@stackra/i18n/react";
import type { RouteComponent } from "@stackra/navigation/native";
import { Button, Card, Chip, ListGroup, Separator } from "@stackra/ui/native";
import { Enum } from "@stackra/validation";
import { Fragment } from "react";
import { Text } from "react-native";
import { Screen } from "#src/components/screen";
import { ScreenState } from "#src/components/screen-state";
import type { OrderDetailRoute } from "#src/routes/order-detail/order-detail.route";
import { useOrderDetail } from "#src/routes/order-detail/use-order-detail";
import { OrderStatus } from "#stackra/clients";
import { I18n } from "#stackra/i18n";

/** The detail; `params.orderId` is validated by `OrderDetailParams` before the loader runs. */
export const OrderDetail: RouteComponent<typeof OrderDetailRoute> = ({ params }) => {
  const { t } = useTranslation();
  const money = useMoney();
  const dateTime = useDateTime();
  const { order, error, refresh, canCancel, cancel, isCancelling } = useOrderDetail(params.orderId);

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
  return (
    <Screen testID="order-detail-page" onRefresh={refresh}>
      <Card>
        <Card.Body className="gap-2">
          <Card.Title>{order.id}</Card.Title>
          <Card.Description>
            {t(I18n.mobile.order.placed_at, {
              at: dateTime(order.createdAt, { dateStyle: "long", timeStyle: "short" }),
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

      <ListGroup accessibilityLabel={t(I18n.mobile.order.lines)}>
        {order.lines.map((line, i) => (
          <Fragment key={line.variantId}>
            {i > 0 ? <Separator className="mx-4" /> : null}
            <ListGroup.Item>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle>{line.variantId}</ListGroup.ItemTitle>
                <ListGroup.ItemDescription>
                  {`${line.quantity} × ${money(line.unitPriceMinor, currency)}`}
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
              {`${a.label}: ${money(a.amountMinor, currency)}`}
            </Text>
          ))}
          <Text className="text-xl font-semibold text-ink">
            {`${t(I18n.mobile.order.total)}: ${money(order.totals.totalMinor, currency)}`}
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
          {t(I18n.mobile.order.cancel)}
        </Button>
      ) : null}
    </Screen>
  );
};
