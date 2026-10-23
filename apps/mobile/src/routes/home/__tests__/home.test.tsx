/**
 * Stackra file contract:
 * Purpose: the home page hides a widget the tenant is not entitled to, navigates by route key
 *          (`Routes.*`), hides the scan action while the quick-order flag is off, and lays out
 *          right-to-left in Arabic with no accessibility violation.
 * Boundary: unit tier; `renderRoute` mounts the route under navigation, i18n, tenant, flag and IAM
 *           fakes.
 * Runtime: react-native
 * Governing contract: ADR 0022, ADR 0081, ADR 0164
 */
import { fakeFlags } from "@stackra/feature-flags/testing";
import { describe, expect, it } from "@stackra/testing";
import { axe, renderRoute, screen, userEvent } from "@stackra/testing/native";
import { OrderPermissions } from "#stackra/clients/commerce";
import { Flags } from "#stackra/flags";
import { Routes } from "#stackra/routes";

/** The dashboard. */
describe("Home", () => {
  /** The panel gates each widget by the tenant's entitlement and the user's permission. */
  it("shows only the widgets the tenant is entitled to and the user may read", () => {
    renderRoute(Routes.home, {
      locale: "en",
      entitlements: ["commerce.orders"],
      permissions: [OrderPermissions.read],
    });
    expect(screen.getByLabelText("Sales")).toBeTruthy();
    expect(screen.queryByLabelText("Low stock")).toBeNull();
  });

  /** A quick action navigates by route key (`Routes.*`), never by name. */
  it("opens the scanner", async () => {
    const { navigation } = renderRoute(Routes.home, { locale: "ar" });
    await userEvent.press(screen.getByTestId("home-scan"));
    expect(navigation.to).toHaveBeenCalledWith(Routes.scan);
  });

  /**
   * Arabic mirrors the layout (logical classes only) and the page passes the accessibility check in
   * RTL.
   */
  it("lays out right-to-left in Arabic with no accessibility violation", async () => {
    const view = renderRoute(Routes.home, { locale: "ar" });
    expect(view.direction).toBe("rtl");
    expect(await axe(view)).toHaveNoViolations();
  });

  /**
   * The scanner is the quick-order entry, so the flag that hides its route hides its button too.
   */
  it("hides the scan action while the quick-order flag is off", () => {
    renderRoute(Routes.home, { flags: fakeFlags([[Flags.orders.quick_order, false]]) });
    expect(screen.queryByTestId("home-scan")).toBeNull();
  });
});
