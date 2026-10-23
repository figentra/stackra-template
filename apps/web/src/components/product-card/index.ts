/**
 * Stackra file contract:
 * Purpose: the component folder's barrel.
 * Boundary: explicit exports only.
 * Runtime: browser
 * Governing contract: ADR 0294 (decision 14: component folders, as amended by programming model
 *                     v3.1, AGENTS.md: the barrel re-exports the component and its Props)
 */
export { ProductCard } from "./product-card";
export type { ProductCardProps } from "./product-card.props";
