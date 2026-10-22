/**
 * Stackra file contract:
 * Purpose: a visitor lands, sees the ladder, declines analytics (nothing is sent), switches to
 *          Arabic (the page flips to RTL and stays on the same page), with no accessibility
 *          violations on either screen; no GET HTML response anywhere on the site sets a cookie,
 *          so every page stays cacheable and a first visit stores nothing; and a `//` path is
 *          redirected to its single-slash form on this site, never to the host it seems to name;
 *          a sitemap file names only a generated source.
 * Boundary: end-to-end tier: the built site on the Worker against the consumed services on memory
 *           drivers with the demo seed. Runs in `chromium`, `chromium-rtl` and `mobile-safari`
 *           (playwright.config.ts).
 * Runtime: node
 * Governing contract: ADR 0182, ADR 0183 (axe fails on serious or critical)
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

/**
 * The site's rule: a GET for HTML never answers with `Set-Cookie`. Consent and the locale choice
 * are written by the browser after the visitor acts, never by a page load.
 */
test("no GET HTML response sets a cookie", async ({ request }) => {
  for (const path of ["/", "/pricing", "/contact", "/store", "/store/demo-tee", "/ar", "/nope"]) {
    const response = await request.get(path, { headers: { accept: "text/html" } });
    expect(response.headers()["content-type"], path).toContain("text/html");
    expect(response.headers()["set-cookie"], path).toBeUndefined();
  }
});

/**
 * The Worker collapses `//` before it builds any redirect: resolved as a URL, `//evil.example/x`
 * would name another host and the 301 would be an open redirect.
 */
test("a double-slash path redirects to its single-slash form on this site", async ({
  request,
  baseURL,
}) => {
  const origin = new URL(String(baseURL)).origin;
  const response = await request.get(`${origin}//evil.example/x?y=1`, { maxRedirects: 0 });
  expect(response.status()).toBe(301);
  expect(response.headers().location).toBe(`${origin}/evil.example/x?y=1`);
});

/** Only the generated sitemap sources answer; a name every object inherits is a 404, not a 500. */
test("an unknown sitemap source is a 404", async ({ request }) => {
  for (const file of ["nope-1.xml", "constructor-1.xml", "__proto__-1.xml"]) {
    expect((await request.get(`/sitemaps/${file}`)).status(), file).toBe(404);
  }
});

/** SEO data must be in the prerendered HTML, since crawlers may not run JavaScript. */
test("landing: structured data and hreflang are in the prerendered HTML", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).toContain('<link rel="alternate" hreflang="ar" href=');
  expect(html).toContain('"@type":"FAQPage"');
  expect(html).toContain('<link rel="canonical"');
});
