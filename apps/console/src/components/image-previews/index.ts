/**
 * Stackra file contract:
 * Purpose: the component folder's barrel.
 * Boundary: the component and its Props only.
 * Runtime: browser
 * Governing contract: ADR 0128 (component folders), ADR 0294 (as amended by programming model v3.1,
 *                     AGENTS.md: props files)
 */
export { ImagePreviews } from "./image-previews";
export type { ImagePreviewsProps } from "./image-previews.props";
