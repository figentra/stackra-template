/**
 * Stackra file contract:
 * Purpose: `/quick-order`: a hand-written screen that places an order with loyalty points for staff
 *          on the phone. Its page is `quick-order.tsx` beside it, bound by name.
 * Boundary: `submit` is the trust boundary: it validates the form with `QuickOrderForm`, folds the
 *           UI-only points field into the loyalty extension, and runs the action through the
 *           generated client, so the Idempotency-Key, the declared toasts and the offline queue
 *           apply; a refusal that names fields lands on them, and a call queued offline stays on
 *           the page. The route's permission (`orders.order.create`) is derived from that action.
 *           The variant picker searches as the user types, so there is no loader. `flag` hides the
 *           route, its tab, its menu entry and its palette intent while `orders.quick_order` is off
 *           for the tenant. The title reuses the orders module's key.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0164 d4 (custom pages), ADR 0165 (form
 *                     adapters), ADR 0252, ADR 0139
 */
import { Route, type RouteContext } from "@stackra/navigation";
import { Icons } from "@stackra/ui/icons";
import { validate } from "@stackra/validation";
import { Commerce } from "#stackra/clients";
import { Flags } from "#stackra/flags";
import { I18n } from "#stackra/i18n";
import { Resources } from "#stackra/resources";
import { ShellLayout } from "#src/routes/shell/shell.layout";
import { QuickOrderForm } from "#src/schemas/quick-order-form.schema";

/** Route `/quick-order`: staff place an order with loyalty points; tab two. */
export class QuickOrderRoute extends Route({
  path: "/quick-order",
  layout: ShellLayout,
  title: I18n.orders.quick_order.title,
  tab: {
    order: 2,
    icon: Icons.Bolt,
  },
  flag: Flags.orders.quick_order,
}) {
  /** Places the order, then opens it in the orders resource; offline, the queue keeps it. */
  override async submit(ctx: RouteContext<this>) {
    const form = validate(QuickOrderForm, await ctx.formData());
    if (!form.success) return ctx.fieldErrors(form.error);
    const result = await ctx.action(
      Commerce.actions.CreateOrder,
      QuickOrderForm.toInput(form.data),
    );
    if (!result.ok) return ctx.fieldErrors(result.error);
    if (result.queued) return null;
    return ctx.redirect(Resources.Order.view, { id: result.data.orderId });
  }
}
