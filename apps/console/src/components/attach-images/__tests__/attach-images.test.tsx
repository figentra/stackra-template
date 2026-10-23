/**
 * Stackra file contract:
 * Purpose: proves the attach-images form attaches every accepted image to the picked product, keeps
 *          going when one image fails, and lists a file that is not an accepted image.
 * Boundary: unit tier, jsdom; the commerce client is the testing fake and uploads go to the media
 *           package's memory driver.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0255 (share target, file handlers)
 */
import { fakeClient } from "@stackra/clients/testing";
import { describe, expect, it, vi } from "@stackra/testing";
import { render, screen, userEvent } from "@stackra/testing/react";
import { AttachProductImageAction, SearchVariantsQuery } from "#stackra/clients/commerce";
import { AttachImages } from "#src/components/attach-images";

/** The seeded demo variant as the search returns it. */
const HIT = {
  variantId: "var_01JA0000000000000000000001",
  productId: "prd_01JA0000000000000000000001",
  sku: "TEE-M",
  title: "Demo tee",
  trackInventory: true,
};

/** Two photographs and one spreadsheet, as a share sheet might send them. */
const FILES = [
  new File(["front"], "front.jpg", { type: "image/jpeg" }),
  new File(["back"], "back.png", { type: "image/png" }),
  new File(["a,b"], "prices.csv", { type: "text/csv" }),
];

/** Picks the demo variant, whose product receives the images. */
async function pickProduct() {
  await userEvent.type(screen.getByRole("combobox", { name: "Product" }), "TEE");
  await userEvent.click(await screen.findByRole("option", { name: /TEE-M/ }));
}

/** Guards the one way images from outside reach a product. */
describe(AttachImages, () => {
  /** Both photographs go to the picked product; the spreadsheet is named and never sent. */
  it("attaches every accepted image and lists the skipped file", async () => {
    const commerce = fakeClient((fake) => {
      fake.on(SearchVariantsQuery).returns({ items: [HIT] });
      fake.on(AttachProductImageAction).returns({ id: HIT.productId });
    });
    const onAttached = vi.fn();
    render(<AttachImages files={FILES} onAttached={onAttached} />, {
      locale: "en",
      clients: [commerce],
    });
    expect(screen.getByText("prices.csv is not an image the console accepts.")).toBeTruthy();
    await pickProduct();
    await userEvent.click(screen.getByRole("button", { name: "Attach to product" }));
    const calls = commerce.called(AttachProductImageAction);
    expect(calls.map((call) => call.productId)).toEqual([HIT.productId, HIT.productId]);
    expect(onAttached).toHaveBeenCalledWith(2);
  });

  /** A refused image is said by name, and the next one is still attached. */
  it("keeps attaching after one image fails, in Arabic", async () => {
    const commerce = fakeClient((fake) => {
      fake.on(SearchVariantsQuery).returns({ items: [HIT] });
      fake.on(AttachProductImageAction).throwsOnce(new Error("network")).returns({ id: "x" });
    });
    const onAttached = vi.fn();
    render(<AttachImages files={FILES.slice(0, 2)} onAttached={onAttached} />, {
      locale: "ar",
      clients: [commerce],
    });
    await userEvent.type(screen.getByRole("combobox", { name: "المنتج" }), "TEE");
    await userEvent.click(await screen.findByRole("option", { name: /TEE-M/ }));
    await userEvent.click(screen.getByRole("button", { name: "إرفاق بالمنتج" }));
    expect(await screen.findByText("تعذّر إرفاق front.jpg. احتُفظ بالصور الأخرى.")).toBeTruthy();
    expect(onAttached).toHaveBeenCalledWith(1);
  });
});
