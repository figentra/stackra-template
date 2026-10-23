/**
 * Stackra file contract:
 * Purpose: proves the shell draws only the navigation items the actor may see, renders
 *          right-to-left in Arabic, and the layout's loader redirects a sessionless visit to the
 *          sign-in route with `returnTo`.
 * Boundary: unit tier, jsdom; navigation comes from the committed gen sample filtered by the fake
 *           gate chain; `runRouteLoader` calls the class's loader with a fake RouteContext.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0214, ADR 0241, ADR 0007
 */
import { describe, expect, it } from "@stackra/testing";
import { renderLayout, runRouteLoader, screen } from "@stackra/testing/react";
import { ShellLayout } from "#src/routes/shell/shell.layout";

/** Guards the shell layout that gates navigation and sessions for every console page. */
describe(ShellLayout, () => {
  /** Navigation must not reveal pages the actor lacks permission for. */
  it("hides a navigation item the actor lacks the permission for", async () => {
    const session = { permissions: ["orders.order.read"] };
    renderLayout(ShellLayout, { route: "/", locale: "en", session });
    expect(await screen.findByRole("link", { name: "Orders" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Products" })).toBeNull();
  });

  /** Arabic must lay the shell out right-to-left with translated navigation. */
  it("renders right-to-left in Arabic", async () => {
    const session = { permissions: ["orders.order.read", "catalogue.product.read"] };
    const { container } = renderLayout(ShellLayout, { route: "/", locale: "ar", session });
    expect(await screen.findByRole("link", { name: "الطلبات" })).toBeTruthy();
    expect(container.closest("[dir]")?.getAttribute("dir")).toBe("rtl");
  });

  /**
   * The loader runs before any child loader, so a protected loader never sees a sessionless
   * request.
   */
  it("redirects a sessionless visit to the sign-in route with returnTo", async () => {
    const result = await runRouteLoader(ShellLayout, {
      session: null,
      path: "/orders/orders?status=paid",
    });
    expect(result.redirect).toBe("/login?returnTo=%2Forders%2Forders%3Fstatus%3Dpaid");
  });
});
