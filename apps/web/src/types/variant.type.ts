/**
 * Stackra file contract:
 * Purpose: one variant of a storefront product, as the generated client returns it.
 * Boundary: a type shared by the variant choice hook and the variant choice type; it is the
 *           client's own shape, never redeclared, so a new field on the view reaches both.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 8)
 */
import type { StorefrontProductView } from "#stackra/clients";

/** One of the product's variants. */
export type Variant = StorefrontProductView["variants"][number];
