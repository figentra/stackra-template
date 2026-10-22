/**
 * Stackra file contract:
 * Purpose: a visitor lands, sees the ladder, declines analytics (nothing is sent), switches to
 *          Arabic (the page flips to RTL and stays on the same page), with no accessibility
 *          violations on either screen.
 * Boundary: end-to-end tier: the built site on the Worker against the consumed services on memory
 *           drivers with the demo seed. Runs in `chromium`, `chromium-rtl` and `mobile-safari`
 *           (playwright.config.ts).
 * Runtime: node
 * Governing contract: ADR 0182, ADR 0183 (axe fails on serious or critical), ADR 0071 (consent
 *                     before analytics)
 */
import { test, expect, axe, seed } from "@stackra/testing/e2e";

/** Each journey starts from freshly seeded data so runs do not depend on order. */
test.beforeEach(async () => {
  await seed("orders.demo");
  await seed("billing.ladder");
  await seed("content.marketing");
});

/** Declined consent must send no analytics, and the locale switch must flip direction and copy. */
test("landing: ladder, consent, locale switch", async ({ page }) => {
  const analyticsCalls: string[] = [];
  await page.route("**/ingest/**", (route) => {
    analyticsCalls.push(route.request().url());
    return route.fulfill({ status: 204 });
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(await axe(page)).toHaveNoViolations();

  await page.getByRole("button", { name: /only necessary|الضروري فقط/ }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await page
    .getByRole("link", { name: /pricing|الأسعار/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/pricing$/);
  expect(analyticsCalls, "declined analytics sends nothing").toHaveLength(0);

  await page.getByRole("combobox", { name: /language|اللغة/ }).selectOption("ar");
  await expect(page).toHaveURL(/\/ar\/pricing$/);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("أسعار واضحة بلا مفاجآت");
  await expect(await axe(page)).toHaveNoViolations();
});

/** SEO data must be in the prerendered HTML, since crawlers may not run JavaScript. */
test("landing: structured data and hreflang are in the prerendered HTML", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).toContain('<link rel="alternate" hreflang="ar" href=');
  expect(html).toContain('"@type":"FAQPage"');
  expect(html).toContain('<link rel="canonical"');
});
