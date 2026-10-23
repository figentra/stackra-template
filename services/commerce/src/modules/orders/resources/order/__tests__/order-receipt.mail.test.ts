/**
 * Stackra file contract:
 * Purpose: proves the receipt mail renders the ICU plural of `orders::order.lines_count` per
 *          locale: the English `one` form and the Arabic `two` and `few` forms (ADR 0192).
 * Boundary: unit tier; unsaved factory records (`make`) mapped by OrderService and rendered with
 *           the testing renderer. No transport, no database.
 * Runtime: node
 * Governing contract: ADR 0080 (i18n), ADR 0192, ADR 0234, ADR 0022
 */
import { createTestingModule } from "@stackra/container/testing";
import { renderMail } from "@stackra/notifications/testing";
import { describe, expect, it } from "@stackra/testing";
import { OrderLineFactory } from "#modules/orders/database/factories/order-line.factory";
import { OrderFactory } from "#modules/orders/database/factories/order.factory";
import { OrdersModule } from "#modules/orders/orders.module";
import { OrderReceiptMail } from "#modules/orders/resources/order/order-receipt.mail";
import { OrderReceiptData } from "#modules/orders/schemas/order-receipt-data.schema";
import { OrderService } from "#modules/orders/services/order.service";

/** The receipt's data for an unsaved paid order with `count` lines. */
async function receipt(count: number): Promise<OrderReceiptData> {
  const mod = await createTestingModule(OrdersModule).useDrivers("memory").compile();
  const order = OrderFactory.new().paid().has(OrderLineFactory.new().count(count)).make();
  return OrderReceiptData.create({ order: mod.get(OrderService).toView(order) });
}

/** Plural forms are where translations break first, so each category is rendered once. */
describe(OrderReceiptMail, () => {
  /** English has two forms; one line must read in the singular. */
  it("uses the English `one` form for a single line", async () => {
    const out = await renderMail(OrderReceiptMail, await receipt(1), { locale: "en" });
    expect(out.text).toContain("1 item");
  });

  /** Arabic has six forms; two lines use the dual and three lines the `few` form. */
  it("uses the Arabic dual and `few` forms", async () => {
    const two = await renderMail(OrderReceiptMail, await receipt(2), { locale: "ar" });
    const three = await renderMail(OrderReceiptMail, await receipt(3), { locale: "ar" });
    expect(two.text).toContain("بندان");
    expect(three.text).toContain("3 بنود");
    expect(three.html).toContain('dir="rtl"');
  });
});
