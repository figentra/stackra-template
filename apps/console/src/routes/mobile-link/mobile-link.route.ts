/**
 * Stackra file contract:
 * Purpose: `/m/*`: the mobile app's universal links (`<appOrigin>/m/...`) for a visitor without the
 *          app. The phone opens the app when it is installed (the association files under
 *          `.stackra/public/.well-known/`); everywhere else the browser lands here, and the route
 *          redirects to the console page that shows the same thing. Its page, `mobile-link.tsx`
 *          beside it, renders only for a link with no console counterpart.
 * Boundary: the mapping mirrors the mobile app's linking paths (apps/mobile `#stackra/linking`):
 *           home, the orders list, a new order, one order, settings, notification preferences,
 *           profile and scan each have a console page; announcements, the inbox and any other path
 *           do not, so the loader returns that path and the page says so with a way to the
 *           dashboard. An order id is accepted only in the public-id shape (`ord_` and 26
 *           characters), so a link cannot inject a path. The shell's loader runs first, so a
 *           signed-out visitor signs in and comes back here; the order page still checks the
 *           permission.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 14, 16 and 17), ADR 0241, ADR 0255
 */
import { Route, type RouteContext } from "@stackra/navigation";
import { I18n } from "#stackra/i18n";
import { Resources } from "#stackra/resources";
import { Routes } from "#stackra/routes";
import { SettingsPages } from "#stackra/settings";
import { ShellLayout } from "#src/routes/shell/shell.layout";

/** The public-id shape of an order, the only parameter a mobile link carries. */
const ORDER_ID = /^ord_[0-9A-Za-z]{26}$/;

/** Route `/m/*`: opens the console page a mobile link names, or says there is none. */
export class MobileLinkRoute extends Route({
  path: "/m/*",
  layout: ShellLayout,
  title: I18n.pages.mobile_link.title,
}) {
  /**
   * Redirects a mobile path to its console page; returns the path for the page's notice when the
   * console has no counterpart. Trailing slashes are ignored (`/m/orders/` is `/m/orders`).
   */
  override loader(ctx: RouteContext<this>) {
    const path = (ctx.params["*"] ?? "").replace(/\/+$/, "");
    const [first, second, ...rest] = path.split("/");
    if (rest.length === 0) {
      if (path === "") return ctx.redirect(Routes.dashboard);
      if (path === "orders") return ctx.redirect(Resources.Order.list);
      if (path === "orders/new" || path === "scan") return ctx.redirect(Routes.quick_order);
      if (first === "orders" && second && ORDER_ID.test(second)) {
        return ctx.redirect(Resources.Order.view, { id: second });
      }
      if (path === "settings" || path === "profile") return ctx.redirect(Routes.settings);
      if (path === "settings/notifications") return ctx.redirect(SettingsPages.messages);
    }
    return { path: `/m/${path}` };
  }
}
