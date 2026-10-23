/**
 * Stackra file contract:
 * Purpose: the offline fallback journey: with the app shell evicted from the cache and the network
 *          off, the worker answers a navigation with the prerendered offline page of the request's
 *          locale (English unprefixed, Saudi Arabic under `/ar-sa/`), the page hydrates, follows
 *          the connection coming back and reloads the requested page on retry.
 * Boundary: the `pwa` Playwright project (service workers allowed); runs after `stackra build
 *           --target pwa`. `evictShell` deletes the shell from the precache, which is the one case
 *           the offline page exists for.
 * Runtime: node
 * Governing contract: ADR 0255 (offline page), ADR 0297 (lowercase locale prefixes), ADR 0182
 */
import { axe, evictShell, expect, loginAs, seed, test } from "@stackra/testing/e2e";

/** Each journey starts signed in with seeded data and the worker in control. */
test.beforeEach(async ({ page }) => {
  await seed("orders.demo");
  await loginAs(page, { role: "staff", tenant: "ten_1" });
  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready);
});

/** The English page, then the connection returning and the retry reaching the requested URL. */
test("serves the English offline page and recovers on retry", async ({ page, context }) => {
  await evictShell(page);
  await context.setOffline(true);
  await page.goto("/orders/orders");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("You are offline");
  await expect(page.getByRole("status")).toHaveText("No connection");
  await expect(await axe(page)).toHaveNoViolations();

  await context.setOffline(false);
  await expect(page.getByRole("status")).toHaveText("Connection restored");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page).toHaveURL(/\/orders\/orders$/);
  await expect(page.getByRole("table")).toBeVisible();
});

/** A Saudi Arabic URL gets the ar-SA copy: right to left, with the overlay's words. */
test("serves the ar-SA offline page right to left", async ({ page, context }) => {
  await evictShell(page);
  await context.setOffline(true);
  await page.goto("/ar-sa/settings");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar-SA");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("أنت غير متصل");
  await expect(page.getByRole("heading", { level: 2 })).toHaveText("ما يعمل دون اتصال");
  await expect(await axe(page)).toHaveNoViolations();
});
