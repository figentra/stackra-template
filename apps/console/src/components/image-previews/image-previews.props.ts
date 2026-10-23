/**
 * Stackra file contract:
 * Purpose: `ImagePreviewsProps`: the images one preview grid shows.
 * Boundary: a props type only, beside its component. The grid makes its object URLs once per
 *           mount, so a caller that changes the set gives it a new `key` instead of new images.
 * Runtime: browser
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: props files)
 */

/** The images to preview, in display order. */
export interface ImagePreviewsProps {
  /** Image files only; each becomes one square tile named after the file. */
  readonly images: readonly File[];
}
