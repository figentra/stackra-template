/**
 * Stackra file contract:
 * Purpose: the Props of `ProductCard`: the card's data and whether it is above the fold.
 * Boundary: a type only; the card is the commerce client's own shape, never redeclared.
 * Runtime: browser
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: Props in
 *                     `<name>.props.ts`)
 */
import type { StorefrontProductCard } from "#stackra/clients/commerce";

/** The card's data and whether it is above the fold. */
export interface ProductCardProps {
  /** One item of the storefront listing. */
  readonly product: StorefrontProductCard;
  /** True for the first row: the image loads eagerly with high priority; the rest are lazy. */
  readonly isPriority?: boolean;
}
