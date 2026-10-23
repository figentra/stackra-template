/**
 * Stackra file contract:
 * Purpose: the orders page: a paginated list of order cards that refreshes itself when an order is
 *          paid.
 * Boundary: a class component bound to `OrdersRoute` by its file name, its props typed
 *           `RouteProps<typeof OrdersRoute>`; composition of the list hook beside it, the card and
 *           the states. A FlatList, not the Screen scroll view, so pages load on end reached.
 *           `params.status` comes typed from `OrdersFilter`.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 7 and 14, as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0061, ADR 0080
 */
import { type RouteProps, useNavigate } from "@stackra/navigation/native";
import { Component } from "@stackra/ui/native";
import { FlatList, RefreshControl, View } from "react-native";
import { OfflineBanner } from "#src/components/offline-banner";
import { OrderCard } from "#src/components/order-card";
import { ScreenState } from "#src/components/screen-state";
import type { OrdersRoute } from "#src/routes/orders/orders.route";
import { useOrders } from "#src/routes/orders/use-orders";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";

/** The orders list page: filters by status from the URL and pages through the tenant's orders. */
export class Orders extends Component<RouteProps<typeof OrdersRoute>> {
  /** Typed navigation by route reference. */
  navigate = useNavigate();

  /** The loaded orders and the paging calls, filtered by the route's status param. */
  list = useOrders(this.props.params.status);

  /** Opens one order's detail. */
  open(orderId: string) {
    this.navigate.to(Routes.order_detail, { orderId });
  }

  /** The loading or error state first, else the list with the banner and the empty state. */
  render() {
    const list = this.list;

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
            title={I18n.pages.orders.empty}
            hint={I18n.pages.orders.empty_hint}
          />
        }
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={(orderId) => this.open(orderId)} />
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
  }
}
