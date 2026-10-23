/**
 * Stackra file contract:
 * Purpose: proves the preview grid makes its object URLs after mount, one per image and named after
 *          it, and revokes exactly those URLs when it unmounts.
 * Boundary: unit tier, jsdom; `URL.createObjectURL` and `URL.revokeObjectURL` are stubbed, since
 *           jsdom has no object URLs.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0255 (share target, file handlers)
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "@stackra/testing";
import { render, screen } from "@stackra/testing/react";
import { ImagePreviews } from "#src/components/image-previews";

/** Two photographs, as a share sheet might send them. */
const IMAGES = [
  new File(["front"], "front.jpg", { type: "image/jpeg" }),
  new File(["back"], "back.png", { type: "image/png" }),
];

/** Guards the one place the console turns local files into object URLs. */
describe(ImagePreviews, () => {
  const create = vi.fn((file: Blob) => `blob:${(file as File).name}`);
  const revoke = vi.fn();
  const original = { create: URL.createObjectURL, revoke: URL.revokeObjectURL };

  beforeEach(() => {
    URL.createObjectURL = create;
    URL.revokeObjectURL = revoke;
  });

  afterEach(() => {
    URL.createObjectURL = original.create;
    URL.revokeObjectURL = original.revoke;
    vi.clearAllMocks();
  });

  /** Tile `i` must show image `i`, or a product gets a photo labelled with another file's name. */
  it("shows one tile per image, each named after its file", async () => {
    render(<ImagePreviews images={IMAGES} />, { locale: "en" });
    const tiles = await screen.findAllByRole("img");
    expect(tiles.map((tile) => [tile.getAttribute("alt"), tile.getAttribute("src")])).toEqual([
      ["front.jpg", "blob:front.jpg"],
      ["back.png", "blob:back.png"],
    ]);
    expect(create).toHaveBeenCalledTimes(2);
  });

  /** An unrevoked object URL keeps its file in memory for the life of the page. */
  it("revokes every URL it made when it unmounts", async () => {
    const { unmount } = render(<ImagePreviews images={IMAGES} />, { locale: "en" });
    await screen.findAllByRole("img");
    unmount();
    expect(revoke.mock.calls.map(([url]) => url)).toEqual(["blob:front.jpg", "blob:back.png"]);
  });
});
