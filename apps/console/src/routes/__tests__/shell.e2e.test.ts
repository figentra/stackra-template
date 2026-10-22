/**
 * Stackra file contract:
 * Purpose: the signed-in shell: navigation from the generated tree, the tenant switcher, the theme
 *          and locale controls, the command palette, with no accessibility violations on each
 *          screen. Runs in English and Arabic.
 * Boundary: end-to-end tier: the real console against the commerce and experience services on
 *           memory drivers with the basic seed. Every e2e journey lives here, beside the route
 *           modules it drives.
 * Runtime: node
 * Governing contract: ADR 0182 (e2e lives in the app, axe is the block), ADR 0022, ADR 0214, ADR
 *                     0245
 */
import { test, expect, loginAs, axe, seed } from "@stackra/testing/e2e";

/** Each journey starts signed in with seeded data so runs do not depend on order. */
test.beforeEach(async ({ page }) => {
  await seed("orders.demo");
  await loginAs(page, { role: "staff", tenant: "ten_1", memberships: ["ten_1", "ten_2"] });
});

/** The generated navigation must reach real pages without accessibility violations. */
test("navigates the generated tree and keeps the shell accessible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/dashboard|لوحة التحكم/);
  await expect(await axe(page)).toHaveNoViolations();

  await page.getByRole("link", { name: /orders|الطلبات/ }).click();
  await expect(page).toHaveURL(/\/orders\/orders$/);
  await expect(page.getByRole("table")).toBeVisible();
  await expect(await axe(page)).toHaveNoViolations();
});

/** Tenant, theme and locale changes must take effect in the shell and keep it accessible. */
test("switches tenant, theme and locale from the shell", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /switch tenant|تبديل المستأجر/ }).click();
  await page.getByRole("menuitemradio", { name: /Beta/ }).click();
  await expect(page.getByRole("button", { name: /switch tenant|تبديل المستأجر/ })).toContainText(
    "Beta",
  );

  await page.getByRole("button", { name: /^theme: |^السمة: / }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", /dark|light/);

  await page.getByRole("button", { name: /switch language|تبديل اللغة/ }).click();
  await page.getByRole("menuitemradio", { name: "العربية" }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(await axe(page)).toHaveNoViolations();
});

/** A free-text search may only propose an action; execution must wait for the user to confirm. */
test("the palette proposes a declared intent and runs it only on confirm", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("ControlOrMeta+K");
  const palette = page.getByRole("dialog", { name: /command palette|لوحة الأوامر/ });
  await expect(await axe(page)).toHaveNoViolations();
  // an `intents` phrase of catalogue.variant.search
  await palette.getByRole("combobox").fill("look up a product at the till");
  await expect(palette.getByRole("group", { name: /suggested action|إجراء مقترح/ })).toBeVisible();
  await palette.getByRole("option", { name: /variant|المتغير/ }).click();
  // the search intent lands on the screen that uses it
  await expect(page).toHaveURL(/\/quick-order/);
});
