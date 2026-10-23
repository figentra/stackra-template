/**
 * Stackra file contract:
 * Purpose: proves `/m/*` sends every mobile link that has a console counterpart to that page (home,
 *          the orders list, a new order, one order, settings, notification preferences, profile,
 *          scan), and returns the path for the notice when there is none or the order id is not a
 *          public id.
 * Boundary: unit tier; `runRouteLoader` calls the loader with a fake RouteContext whose splat
 *           parameter is the mobile path.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0241, ADR 0255
 */
import { describe, expect, it } from "@stackra/testing";
import { runRouteLoader } from "@stackra/testing/react";
import { MobileLinkRoute } from "#src/routes/mobile-link/mobile-link.route";

/** A public order id in the seeded shape. */
const ORDER = "ord_01JA0000000000000000000001";

/** Runs the loader for one mobile path (what follows `/m/`). */
function open(path: string) {
  return runRouteLoader(MobileLinkRoute, { params: { "*": path } });
}

/** Guards the landing of the mobile app's universal links in a browser. */
describe(MobileLinkRoute, () => {
  /** Each mobile screen with a console page opens that page, so a shared link still helps. */
  it.each([
    ["", "/"],
    ["orders", "/orders/orders"],
    ["orders/", "/orders/orders"],
    ["orders/new", "/quick-order"],
    ["scan", "/quick-order"],
    [`orders/${ORDER}`, `/orders/orders/${ORDER}`],
    ["settings", "/settings"],
    ["profile", "/settings"],
    ["settings/notifications", "/settings/messages"],
  ])("opens /m/%s at %s", async (path, target) => {
    expect((await open(path)).redirect).toBe(target);
  });

  /** No redirect is built from a path the console does not know, so a link cannot steer it. */
  it.each([
    "announcements",
    "inbox",
    "orders/not-an-id",
    "orders/..%2f..%2fadmin",
    `orders/${ORDER}/extra`,
    "nope",
  ])("keeps /m/%s for the notice", async (path) => {
    const result = await open(path);
    expect(result.redirect).toBeUndefined();
    expect(result.data).toEqual({ path: `/m/${path}` });
  });
});
