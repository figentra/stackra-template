/**
 * Stackra file contract:
 * Purpose: the fact that a product stopped selling; carries the variant ids so search and
 *          storefront can drop them without a lookup. Public: `catalogue.product.archived.v1`.
 * Boundary: one event per class; recorded by the Archive transition only.
 * Runtime: isomorphic
 * Governing contract: ADR 0141, ADR 0078, guides/programming-model.mdx#events
 */
import { Event, IntegrationEvent, z } from "@stackra/events";

/** Consumed by search and the storefront. */
@Event({ name: "product.archived", public: true })
export class ProductArchived extends IntegrationEvent(
  z.object({ productId: z.string(), variantIds: z.array(z.string()) }),
) {}
