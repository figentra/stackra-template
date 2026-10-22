/**
 * Stackra file contract:
 * Purpose: a declared resource end to end: the products list (search, filter, sort), the detail
 *          view, the edit form with the image upload and the variants repeater, and a row action
 *          with its declared confirmation.
 * Boundary: no screen code exists for any of this: it is `catalogue.product` from the manifest
 *           rendered by @stackra/panel, seeded by `orders.demo` (the `demo-tee` product). The
 *           upload goes to the media fake.
 * Runtime: node
 * Governing contract: ADR 0164 (resources rendered generically), ADR 0139 (declared UX), ADR 0182
 */
import { test, expect, loginAs, axe, seed } from "@stackra/testing/e2e";

/** A one-pixel PNG, enough for the upload field's type and size checks. */
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5" +
    "ErkJggg==",
  "base64",
);

/** Each journey starts signed in with seeded data so runs do not depend on order. */
test.beforeEach(async ({ page }) => {
  await seed("orders.demo");
  await loginAs(page, { role: "admin", tenant: "ten_1" });
});

/** Generated resource pages must support the full list, view and edit flow accessibly. */
test("list, view and edit a product through the generated resource", async ({ page }) => {
  await page.goto("/catalogue/products");
  await page.getByRole("searchbox").fill("tee");
  await expect(page.getByRole("row", { name: /demo tee/i })).toBeVisible();
  await expect(await axe(page)).toHaveNoViolations();

  await page
    .getByRole("row", { name: /demo tee/i })
    .getByRole("link")
    .first()
    .click();
  await expect(page).toHaveURL(/\/catalogue\/products\/prd_01JA0000000000000000000001$/);
  await expect(page.getByRole("region", { name: /variants|المتغيرات/ })).toBeVisible();
  await expect(await axe(page)).toHaveNoViolations();

  await page.getByRole("link", { name: /edit|تعديل/ }).click();
  await page
    .getByLabel(/images|الصور/)
    .setInputFiles({ name: "tee.png", mimeType: "image/png", buffer: PNG });
  // Field.repeater("variants")
  await page.getByRole("button", { name: /add variant|إضافة متغير/ }).click();
  await page.getByLabel(/sku/i).last().fill("TEE-XL");
  await page.getByRole("button", { name: /save|حفظ/ }).click();
  await expect(page.getByRole("status")).toContainText(/saved|تم الحفظ/);
});

/** Destructive row actions must ask for confirmation before they run. */
test("a row action runs with its declared confirmation", async ({ page }) => {
  await page.goto("/catalogue/products");
  const row = page.getByRole("row", { name: /demo tee/i });
  await row.getByRole("button", { name: /actions|إجراءات/ }).click();
  await page.getByRole("menuitem", { name: /archive|أرشفة/ }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: /archive|أرشفة/ })
    .click(); // requiresConfirmation, warning
  await expect(page.getByRole("status")).toContainText(/archived|تمت الأرشفة/);
  await expect(await axe(page)).toHaveNoViolations();
});
