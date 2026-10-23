/**
 * Stackra file contract:
 * Purpose: proves the share target takes the payload the service worker stored, shows the shared
 *          text with a catalogue search and the images in the attach form, and shows the empty
 *          state for an unknown or already used id.
 * Boundary: unit tier, jsdom; `renderRoute` runs the shell's and the route's loaders; the share
 *           inbox is the platform package's testing fake.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0255 (share target)
 */
import { describe, expect, it } from "@stackra/testing";
import { renderRoute, screen } from "@stackra/testing/react";
import { Routes } from "#stackra/routes";
import { ShareRoute } from "#src/routes/share/share.route";

/** A photograph shared with a line of text, as the worker stored it. */
const SHARED = {
  title: "Linen shirt",
  text: "Linen shirt, sand",
  files: [new File(["img"], "shirt.webp", { type: "image/webp" })],
};

/** Guards the page another app's share sheet opens. */
describe(ShareRoute, () => {
  /** The payload is taken once: the text, its search and the image form all render. */
  it("shows the shared text, its catalogue search and the attach form", async () => {
    const { platform } = renderRoute(Routes.share, {
      locale: "en",
      search: { shared: "sh_1" },
      session: { permissions: ["catalogue.product.update"] },
      platform: { shareTarget: { sh_1: SHARED } },
    });
    expect(await screen.findByText("Linen shirt, sand")).toBeTruthy();
    const search = screen.getByRole("link", { name: "Search the catalogue for this text" });
    expect(search.getAttribute("href")).toBe("/catalogue/products?search=Linen+shirt%2C+sand");
    expect(screen.getByRole("button", { name: "Attach to product" })).toBeTruthy();
    expect(platform.shareTarget.remaining()).toEqual([]);
  });

  /** A reused or unknown id has nothing behind it, which is said in the user's language. */
  it("shows the empty state in Arabic when nothing was shared", async () => {
    renderRoute(Routes.share, {
      locale: "ar",
      search: { shared: "sh_gone" },
      session: { permissions: [] },
    });
    expect(await screen.findByText("لم تتم مشاركة شيء")).toBeTruthy();
  });
});
