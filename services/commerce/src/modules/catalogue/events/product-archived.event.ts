/**
 * Stackra file contract:
 * Purpose: the fact that a product stopped selling. Leaves through the outbox as
 *          `catalogue.product.archived.v1`, so search and the storefront drop its variants.
 * Boundary: an integration event recorded by ProductStateMachine#archive only. It carries the
 *           variant ids, so no consumer needs a lookup.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 5, 16 and 20), ADR 0141, ADR 0078
 */
import type { PublicId } from "@stackra/contracts";
import { IntegrationEvent } from "@stackra/events";

/** Consumed by search and the storefront. */
export class ProductArchived extends IntegrationEvent({ name: "product.archived" }) {
  /** The archived product. */
  productId!: PublicId<"prd">;

  /** Its variants at the time of archiving. */
  variantIds!: PublicId<"var">[];
}
