/**
 * Stackra file contract:
 * Purpose: the PWA offline journey: the shell loads from the service worker, a mutation is queued
 *          with the action's declared offline toast and replays exactly once back online, and a
 *          never-visited page renders inside the cached app shell with the offline banner (the
 *          `/offline` page is only for a worker with no shell cached).
 * Boundary: the `pwa` Playwright project (service workers allowed). The server mock asserts the
 *           Idempotency-Key, so a double replay fails the test. Runs after `stackra build --target
 *           pwa`.
 * Runtime: node
 * Governing contract: ADR 0255 (service worker serves the shell), ADR 0252 (queue replays), ADR
 *                     0182
 */
import { test, expect, loginAs, seed, apiCalls, axe } from "@stackra/testing/e2e";

/**
 * An order taken offline must be sent exactly once on reconnect, or the customer is double-charged.
 */
test("works offline and replays the queued order once", async ({ page, context }) => {
  await seed("orders.demo");
  await loginAs(page, { role: "staff", tenant: "ten_1" });
  await page.goto("/quick-order");
  await page.evaluate(() => navigator.serviceWorker.ready); // the shell is precached from here on

  await context.setOffline(true);
  await page.reload();
  // shell from the SW, no network
  await expect(page.getByRole("heading", { name: /quick order|طلب سريع/ })).toBeVisible();
  await expect(page.getByRole("status")).toContainText(/offline|غير متصل/);

  await expect(await axe(page)).toHaveNoViolations();
  await page.getByRole("combobox", { name: /variant|المتغير/ }).fill("TEE");
  await page.getByRole("option").first().click();
  await page.getByRole("button", { name: /place order|إنشاء الطلب/ }).click();
  // the action's declared queued UX
  await expect(page.getByRole("status")).toContainText(/saved offline|حُفظ دون اتصال/);
  await expect(page.getByRole("button", { name: /pending changes: 1/i })).toBeVisible();

  await context.setOffline(false);
  await expect(page.getByRole("button", { name: /pending changes: 0/i })).toBeVisible();
  expect(apiCalls("orders.order.create@1")).toHaveLength(1);
  expect(
    new Set(apiCalls("orders.order.create@1").map((c) => c.headers["idempotency-key"])).size,
  ).toBe(1);
});

/**
 * A page never opened online has no cached copy, so the worker answers with the app shell: the
 * navigation stays usable and the banner says the data is not here, instead of a dead end.
 */
test("renders a never-visited route in the cached shell", async ({ page, context }) => {
  await seed("orders.demo");
  await loginAs(page, { role: "staff", tenant: "ten_1" });
  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.goto("/catalogue/products");
  const navigation = page.getByRole("navigation", { name: /main navigation|التنقل الرئيسي/i });
  await expect(navigation).toBeVisible();
  await expect(page.getByRole("status")).toContainText(/you are offline|أنت غير متصل/i);
  await expect(await axe(page)).toHaveNoViolations();
});
