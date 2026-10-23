/**
 * Stackra file contract:
 * Purpose: a grid of square previews of local image files, one tile per image, in the order given.
 * Boundary: the object URLs are a side effect, so they are made in `mount()` (never while
 *           rendering) for the images of this mount and revoked in `unmount()`; Strict Mode's extra
 *           mount and unmount therefore leaks nothing. One mount serves one image set: the caller
 *           keys the grid by its set, so a new set remounts it and tile `i` always shows
 *           `images[i]`. The first frame has no tiles yet. A class component; gen compiles it to a
 *           function component.
 * Runtime: browser
 * Governing contract: ADR 0255 (share target, file handlers), ADR 0294 (as amended by programming
 *                     model v3.1, AGENTS.md: class components and lifecycle)
 */
import { useRef } from "react";
import { Component } from "@stackra/ui";
import type { ImagePreviewsProps } from "./image-previews.props";

/** The preview tiles of one image set. */
export class ImagePreviews extends Component<ImagePreviewsProps> {
  /** The object URLs the tiles render, index for index with `images`; empty until mounted. */
  urls: readonly string[] = [];

  /** The URLs this mount made; `unmount()` reads it because state there is the first render's. */
  made = useRef<readonly string[]>([]);

  /** Makes one object URL per image of this mount. */
  mount() {
    const urls = this.props.images.map((image) => URL.createObjectURL(image));
    this.made.current = urls;
    this.urls = urls;
  }

  /** Frees the URLs; the browser keeps an object URL's file alive until it is revoked. */
  unmount() {
    for (const url of this.made.current) URL.revokeObjectURL(url);
  }

  /** One tile per URL, named after its file. */
  render() {
    return (
      <ul className="grid grid-cols-3 gap-2">
        {this.urls.map((url, index) => (
          <li key={url}>
            <img
              src={url}
              alt={this.props.images[index]?.name ?? ""}
              className="aspect-square w-full rounded object-cover"
            />
          </li>
        ))}
      </ul>
    );
  }
}
