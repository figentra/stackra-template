/**
 * Stackra file contract:
 * Purpose: the order detail page: status, lines, totals with the hook-applied adjustments, and the
 *          cancel action when allowed. Renders the order `OrderDetailRoute` prefetched and keeps it
 *          fresh through its hook.
 * Boundary: composition. Cancel goes through the generated client: the declared confirmation, the
 *           Idempotency-Key and the success toast are the client hook's, not this page's. The
 *           status label and colour come from the producer's enum.
 * Runtime: react-native
 * Governing contract: ADR 0080, ADR 0082, ADR 0139
 */
import { useDateTime, useMoney, useTranslation } from "@stackra/i18n/react";
import type { RouteComponent } from "@stackra/navigation/native";
import { Button, Card, Chip, ListGroup, Separator } from "@stackra/ui/native";
import { Fragment } from "react";
import { Text } from "react-native";
import { useOrderDetail } from "#src/components/pages/order-detail/use-order-detail";
import { Screen } from "#src/components/ui/screen";
import { ScreenState } from "#src/components/ui/screen-state";
import type { OrderDetailRoute } from "#src/routes/order-detail.route";
import { I18n } from "#stackra/i18n";

/** The detail; `params.orderId` is validated by `OrderDetailParams` before the prefetch runs. */
export const OrderDetailPage: RouteComponent<typeof OrderDetailRoute> = ({ params }) => {
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
          <Chip size="sm" variant="soft" color={order.status.meta.color} className="self-start">
            <Chip.Label>{t(order.status.label)}</Chip.Label>
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
