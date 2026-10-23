/**
 * Stackra file contract:
 * Purpose: governs `Product.status`: draft → active → archived, and the event archiving records.
 * Boundary: bound to its model by the type argument (`StateMachine<Product>`); `field` names the
 *           state column. Each method is a transition. The decorator checks `from`, runs the body
 *           in the caller's unit of work, writes `to`, and otherwise refuses with
 *           `transition_not_allowed`. Recorded events reach the outbox when the unit of work
 *           flushes, so a rolled-back archive emits nothing. Inherited: `can(product, "archive")`
 *           and `available(product)`. No other code writes `status`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 6, 11 and 16), ADR 0161 (state machine), ADR 0141
 */
import { StateMachine, Transition } from "@stackra/state-machine";
import { ProductStatus } from "#modules/catalogue/enums/product-status.enum";
import { ProductArchived } from "#modules/catalogue/events/product-archived.event";
import type { Product } from "#modules/catalogue/models/product.model";

/** `active` is the only sellable state; `archived` is final. */
export class ProductStateMachine extends StateMachine<Product>({ field: "status" }) {
  /** Puts a draft on sale; the decorator writes the status, and nothing is recorded. */
  @Transition({
    from: ProductStatus.Draft,
    to: ProductStatus.Active,
  })
  activate(_product: Product): void {
    // storefront reads pick the product up by its status, so there is no event to record
  }

  /**
   * Takes an active product off sale and records `product.archived` with its variant ids, so search
   * and the storefront drop them without a lookup. The variants must be populated.
   */
  @Transition({
    from: ProductStatus.Active,
    to: ProductStatus.Archived,
  })
  archive(product: Product): void {
    product.record(
      ProductArchived.create({
        productId: product.id,
        variantIds: product.variants.map((variant) => variant.id),
      }),
    );
  }
}
