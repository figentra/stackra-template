/**
 * Stackra file contract:
 * Purpose: online, a submit replaces the sheet with the order detail; offline, the call is queued,
 *          the queued toast shows and the sheet closes; both send the same input through the faked
 *          client, with `extensions.loyalty` only when points are entered.
 * Boundary: unit tier; the client fake records calls; the network fake flips the offline path.
 * Runtime: react-native
 * Governing contract: ADR 0022, ADR 0055, ADR 0059
 */
import { fakeClient } from "@stackra/clients/testing";
import { fakePlatform } from "@stackra/platform/testing";
import { describe, expect, it } from "@stackra/testing";
import { renderRoute, screen, userEvent } from "@stackra/testing/native";
import { Commerce, OrderStatus } from "#stackra/clients";
import { Routes } from "#stackra/routes";

const variantId = "var_01H2J3K4L5M6N7P8Q9R0ABCDEF";
const orderId = "ord_01H2J3K4L5M6N7P8Q9R0ABCDEF";
const base = {
  params: { variantId },
  permissions: [Commerce.permissions.Order.create],
} as const;
const placed = () =>
  fakeClient(Commerce, (fake) =>
    fake.actions.CreateOrder.returns({
      orderId,
      status: OrderStatus.PendingPayment,
      totals: { currency: "SAR", subtotalMinor: 0, adjustments: [], totalMinor: 0 },
      paymentClientSecret: "cs",
    }),
  );

/** The sheet over its route. */
describe("CreateOrder", () => {
  /** Online: the sheet is replaced by the detail route; zero points send no loyalty extension. */
  it("places the order and opens the detail when online", async () => {
    const commerce = placed();
    const { navigation } = renderRoute(Routes.create_order, {
      ...base,
      locale: "en",
      clients: [commerce],
    });
    await userEvent.press(screen.getByTestId("create-order-submit"));
    expect(commerce.called(Commerce.actions.CreateOrder)).toEqual([
      { lines: [{ variantId, quantity: 1 }], extensions: {} },
    ]);
    expect(navigation.replace).toHaveBeenCalledWith(Routes.order_detail, { orderId });
  });

  /** Entered points travel in the loyalty extension the loyalty module's extension reads. */
  it("sends the entered points in extensions.loyalty", async () => {
    const commerce = placed();
    renderRoute(Routes.create_order, { ...base, locale: "en", clients: [commerce] });
    await userEvent.clear(screen.getByTestId("field-points"));
    await userEvent.type(screen.getByTestId("field-points"), "250");
    await userEvent.press(screen.getByTestId("create-order-submit"));
    expect(commerce.called(Commerce.actions.CreateOrder)).toEqual([
      { lines: [{ variantId, quantity: 1 }], extensions: { loyalty: { redeemPoints: 250 } } },
    ]);
  });

  /** Offline: the call is held in the outbox with its key; the toast shows; the sheet closes. */
  it("queues the order and closes the sheet when offline", async () => {
    const commerce = fakeClient(Commerce);
    const { navigation, queue } = renderRoute(Routes.create_order, {
      ...base,
      locale: "ar",
      clients: [commerce],
      platform: fakePlatform({ network: { isOnline: false } }),
    });
    await userEvent.press(screen.getByTestId("create-order-submit"));
    expect(queue.items).toEqual([
      expect.objectContaining({
        action: Commerce.actions.CreateOrder,
        idempotencyKey: expect.any(String),
      }),
    ]);
    expect(await screen.findByText("سيُرسل الطلب عند عودة الاتصال")).toBeTruthy();
    expect(navigation.back).toHaveBeenCalled();
  });
});
