/**
 * Stackra file contract:
 * Purpose: the staff journey: log in, place a quick order with points, land on the order view, with
 *          no accessibility violations on either screen. Runs in English and Arabic (the
 *          `chromium-rtl` project).
 * Boundary: end-to-end tier: the real console against the commerce service on memory drivers with
 *           the `orders.demo` seed; the payments and pricing services are the e2e preset's stubs.
 *           No unit assertions about internals.
 * Runtime: node
 * Governing contract: ADR 0182 (e2e lives in the app, axe is the block), ADR 0022
 */
import { test, expect, loginAs, axe, seed } from "@stackra/testing/e2e";

/** Each journey starts signed in with seeded data so runs do not depend on order. */
test.beforeEach(async ({ page }) => {
  await seed("orders.demo");
  await loginAs(page, { role: "staff", tenant: "ten_1" });
});

/**
 * The quick order with loyalty points must work end to end and stay accessible before and after.
 */
test("staff places a quick order with loyalty points", async ({ page }) => {
  await page.goto("/quick-order");
  await expect(await axe(page)).toHaveNoViolations();

  await page.getByLabel(/variant|المتغير/).fill("TEE");
  await page.getByRole("option", { name: /TEE-M/ }).click();
  await page.getByLabel(/loyalty points|نقاط الولاء/).fill("100");
  await page.getByRole("button", { name: /place order|إنشاء الطلب/ }).click();

  // QuickOrderRoute.submit redirects to the order's view
  await expect(page).toHaveURL(/\/orders\/orders\/ord_/);
  // the adjustment row in the infolist
  await expect(page.getByText(/loyalty points|نقاط الولاء/)).toBeVisible();
  await expect(await axe(page)).toHaveNoViolations();
});
