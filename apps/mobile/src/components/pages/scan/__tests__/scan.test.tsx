/**
 * Stackra file contract:
 * Purpose: a decoded barcode is looked up and returns the variant to the sheet; an unknown code
 *          shows the refusal and a retry; both outcomes send the consent-gated analytics event; a
 *          target without a scanner shows the unavailable state instead of crashing.
 * Boundary: unit tier; the platform fake's scanner emits codes; the client fake answers the lookup;
 *           the analytics fake records events.
 * Runtime: react-native
 * Governing contract: ADR 0022, ADR 0071, ADR 0250
 */
import { fakeAnalytics } from "@stackra/analytics/testing";
import { fakeClient } from "@stackra/clients/testing";
import { refusal } from "@stackra/errors/testing";
import { fakePlatform } from "@stackra/platform/testing";
import { describe, expect, it } from "@stackra/testing";
import { act, renderRoute, screen } from "@stackra/testing/native";
import { BarcodeScanned } from "#src/analytics/barcode-scanned.event";
import { Commerce } from "#stackra/clients";
import { Routes } from "#stackra/routes";

const granted = () => fakePlatform({ scanner: { isAvailable: true, permission: "granted" } });
const hit = {
  variantId: "var_01H2J3K4L5M6N7P8Q9R0ABCDEF",
  productId: "prd_01H2J3K4L5M6N7P8Q9R0ABCDEF",
  sku: "TEE-M",
  title: "Dates 1kg",
  trackInventory: true,
};

/** The scanner page over its route. */
describe("ScanPage", () => {
  /** A known code replaces the modal with the sheet, pre-filled, and records a found scan. */
  it("returns the found variant to the create-order sheet", async () => {
    const platform = granted();
    const analytics = fakeAnalytics();
    const commerce = fakeClient(Commerce, (fake) => fake.queries.GetVariantByBarcode.returns(hit));
    const { navigation } = renderRoute(Routes.scan, { platform, analytics, clients: [commerce] });
    await act(() => platform.scanner.emit("6281000000012"));
    expect(navigation.replace).toHaveBeenCalledWith(Routes.create_order, {
      variantId: hit.variantId,
    });
    expect(analytics.tracked).toEqual([new BarcodeScanned({ found: true })]);
  });

  /** An unknown code shows the catalogue's `variant_not_found` text and a retry. */
  it("shows the refusal and a retry for an unknown code", async () => {
    const platform = granted();
    const commerce = fakeClient(Commerce, (fake) =>
      fake.queries.GetVariantByBarcode.throws(refusal(Commerce.refusals.variant_not_found)),
    );
    renderRoute(Routes.scan, { locale: "en", platform, clients: [commerce] });
    await act(() => platform.scanner.emit("00000000"));
    expect(await screen.findByText("No product matches this barcode.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });

  /** No camera (simulator): the unavailable state, not a crash. */
  it("renders the unavailable state on a target without a scanner", () => {
    renderRoute(Routes.scan, {
      locale: "en",
      platform: fakePlatform({ scanner: { isAvailable: false } }),
    });
    expect(screen.getByTestId("scan-unavailable")).toBeTruthy();
  });
});
