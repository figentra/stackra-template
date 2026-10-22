/**
 * Stackra file contract:
 * Purpose: `/quick-order`: a hand-written screen that places an order with loyalty points for staff
 *          on the phone.
 * Boundary: fully declarative: `prefetch` warms the variant search, `submits` names the action, the
 *           form schema and the redirect, and the route's permission is derived from both. `flag`
 *           hides the route, its menu entry and its palette intent while `orders.quick_order` is
 *           off for the tenant. The action runs through the generated client, so the
 *           Idempotency-Key, the declared toast and the offline queue apply.
 * Runtime: browser
 * Governing contract: ADR 0164 d4 (custom pages), ADR 0165 (form adapters), ADR 0252, ADR 0139
 */
import { Route } from "@stackra/navigation";
import { Icons } from "@stackra/ui/icons";
import { Commerce } from "#stackra/clients";
import { Flags } from "#stackra/flags";
import { I18n } from "#stackra/i18n";
import { Resources } from "#stackra/resources";
import { QuickOrderPage } from "#src/components/pages/quick-order";
import { ShellLayout } from "#src/routes/shell.layout";
import { QuickOrderForm } from "#src/schemas/quick-order-form.schema";

/** Route `/quick-order`: a hand-written screen for staff to place an order with loyalty points. */
@Route({
  path: "/quick-order",
  layout: ShellLayout,
  tab: { order: 2, icon: Icons.Bolt, label: I18n.orders.quick_order.title },
  flag: Flags.orders.quick_order,
  prefetch: [Commerce.queries.SearchVariants],
  submits: {
    action: Commerce.actions.CreateOrder,
    form: QuickOrderForm,
    redirect: (output) => [Resources.Order.view, { id: output.orderId }],
  },
  component: QuickOrderPage,
  title: I18n.orders.quick_order.title,
})
export class QuickOrderRoute {}
