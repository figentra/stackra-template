/**
 * Stackra file contract:
 * Purpose: the orders page: a paginated list of order cards that refreshes itself when an order is
 *          paid.
 * Boundary: a function component bound to `OrdersRoute` by its file name; composition of the list
 *           hook beside it, the card and the states. A FlatList, not the Screen scroll view, so
 *           pages load on end reached. `params.status` comes typed from `OrdersFilter`.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 7 and 14), ADR 0061, ADR 0080
 */
import { type RouteComponent, useNavigate } from "@stackra/navigation/native";
import { FlatList, RefreshControl, View } from "react-native";
import { OfflineBanner } from "#src/components/offline-banner";
import { OrderCard } from "#src/components/order-card";
import { ScreenState } from "#src/components/screen-state";
import type { OrdersRoute } from "#src/routes/orders/orders.route";
import { useOrders } from "#src/routes/orders/use-orders";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";

/** The orders list page: filters by status from the URL and pages through the tenant's orders. */
export const Orders: RouteComponent<typeof OrdersRoute> = ({ params }) => {
  const navigate = useNavigate();
  const list = useOrders(params.status);

  if (list.isLoading)
    return (
      <View className="flex-1 bg-background px-4 pt-2">
        <ScreenState kind="loading" rows={6} />
      </View>
    );
  if (list.error && list.orders.length === 0)
    return (
      <View className="flex-1 bg-background px-4 pt-2">
        <ScreenState kind="error" error={list.error} onRetry={list.refresh} />
      </View>
    );

  return (
    <FlatList
      testID="orders-list"
      contentInsetAdjustmentBehavior="automatic"
      className="flex-1 bg-background"
      contentContainerClassName="gap-3 px-4 pb-16 pt-2"
      data={list.orders}
      keyExtractor={(order) => order.id}
      ListHeaderComponent={<OfflineBanner />}
      ListEmptyComponent={
        <ScreenState
          kind="empty"
          title={I18n.mobile.orders.empty}
          hint={I18n.mobile.orders.empty_hint}
        />
      }
      renderItem={({ item }) => (
        <OrderCard
          order={item}
          onPress={(orderId) => navigate.to(Routes.order_detail, { orderId })}
        />
      )}
      onEndReached={list.loadMore}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={list.isFetching && list.orders.length > 0}
          onRefresh={list.refresh}
        />
      }
    />
  );
};
