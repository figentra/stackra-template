/**
 * Stackra file contract:
 * Purpose: the contact form refuses a bad email in the browser with the translated message, then
 *          sends a good one and shows the thank-you with the name echoed; works with JavaScript off
 *          (the action, not the adapter, decides).
 * Boundary: end-to-end tier; the marketing service on memory drivers; Turnstile in the e2e preset's
 *           test mode (the widget always passes, the Worker's secret is the Cloudflare test key).
 * Runtime: node
 * Governing contract: ADR 0182, ADR 0165 decision 2 (form adapters)
 */
import { test, expect, axe } from "@stackra/testing/e2e";

/** Visitors must be able to fix errors and then reach a confirmation, accessibly. */
test("contact: validation, then a sent lead", async ({ page }) => {
  await page.goto("/contact");
  await expect(await axe(page)).toHaveNoViolations();

  await page.getByLabel(/your name|اسمك/).fill("Lina");
  await page.getByLabel(/work email|البريد الإلكتروني للعمل/).fill("not-an-email");
  await page
    .getByLabel(/how can we help|كيف يمكننا المساعدة/)
    .fill("We need a store for two brands.");
  await page.getByRole("button", { name: /^send$|^إرسال$/ }).click();
  await expect(
    page.getByText(/does not look like an email|هذا لا يبدو بريدًا إلكترونيًا/),
  ).toBeVisible();

  await page.getByLabel(/work email|البريد الإلكتروني للعمل/).fill("lina@northwind.example");
  await page.getByLabel(/you may contact me|يمكنكم التواصل معي/).check();
  await page.getByRole("button", { name: /^send$|^إرسال$/ }).click();
  await expect(page.getByRole("status")).toContainText(/Lina/);
  await expect(await axe(page)).toHaveNoViolations();
});

/** The form is a progressive enhancement and must still submit without client scripts. */
test("contact: no JavaScript still works", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/contact");
  await page.getByLabel(/your name/).fill("Omar");
  await page.getByLabel(/work email/).fill("omar@northwind.example");
  await page.getByLabel(/how can we help/).fill("Can we migrate from our old shop?");
  await page.getByLabel(/you may contact me/).check();
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByRole("status")).toContainText("Omar");
  await context.close();
});
