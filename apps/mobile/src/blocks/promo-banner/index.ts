/**
 * Stackra file contract:
 * Purpose: the block folder's barrel: the declaration and its component.
 * Boundary: explicit export only; the props schema lives in schemas/promo-banner.schema.ts.
 * Runtime: isomorphic
 * Governing contract: ADR 0128
 */
export { PromoBannerBlock } from "./promo-banner.block";
export { PromoBanner } from "./promo-banner";
