/**
 * Stackra file contract:
 * Purpose: the shopping journey: list, search, open a product, change a variant (price updates),
 *          and the 404 page for an unknown slug; plus the crawler's view: Product JSON-LD, robots
 *          and the products sitemap.
 * Boundary: end-to-end tier against the commerce service on memory drivers with the `orders.demo`
 *           seed (the `demo-tee` product, size M in stock and L out of stock). No cart assertions:
 *           the cart arrives with checkout.
 * Runtime: node
 * Governing contract: ADR 0182, ADR 0183
 */
import assert from "node:assert/strict";
import { test, expect, axe, seed } from "@stackra/testing/e2e";

/** Each journey starts from freshly seeded catalogue data so runs do not depend on order. */
test.beforeEach(async () => {
  await seed("orders.demo");
});

/** Covers the whole shopping path end to end, including accessibility and the not-found case. */
test("store: list, search, detail, variant, 404", async ({ page }) => {
  await page.goto("/store");
  await expect(await axe(page)).toHaveNoViolations();
  await page.getByRole("searchbox", { name: /search products|ابحث عن المنتجات/ }).fill("tee");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\?q=tee/);

  await page.getByRole("link", { name: /demo tee/i }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/demo tee/i);
  const price = page.getByTestId("price");
  const before = await price.textContent();
  assert(before, "the product page shows a price");
  await page.getByRole("button", { name: /option: size|الخيار: size/i }).click();
  await page.getByRole("option", { name: "L" }).click();
  await expect(price).not.toHaveText(before);
  await expect(await axe(page)).toHaveNoViolations();

  const missing = await page.goto("/store/does-not-exist");
  expect(missing?.status()).toBe(404);
  // the not-found page is the root boundary @stackra/navigation owns, with one heading
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(await axe(page)).toHaveNoViolations();
});

/**
 * Search engines read the server-rendered HTML, so structured data, sitemap and robots must be
 * correct there.
 */
test("store: what a crawler sees", async ({ request }) => {
  const html = await (await request.get("/store/demo-tee")).text();
  expect(html).toContain('"@type":"Product"');
  expect(html).toContain('"@type":"BreadcrumbList"');
  expect(html).toContain('property="og:image" content="');

  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Sitemap: ");

  const sitemap = await (await request.get("/sitemaps/products.xml")).text();
  expect(sitemap).toContain("<loc>");
  expect(sitemap).toContain('hreflang="ar"');
  expect(sitemap).toContain("<image:image>");

  expect((await request.get("/og/product/demo-tee")).headers["content-type"]).toBe("image/png");
});
