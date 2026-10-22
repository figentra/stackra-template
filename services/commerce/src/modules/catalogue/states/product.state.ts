/**
 * Stackra file contract:
 * Purpose: the Product lifecycle as a state family: Draft → Active → Archived, with `Archive`
 *          recording the public event.
 * Boundary: a state family is one declaration and one file (the one exception to
 *           one-class-per-file, ADR 0128 d2, because the family references itself). `isSellable` is
 *           the one question other code asks; `ModelState` and `Transition` come from
 *           @stackra/state-machine.
 * Runtime: node
 * Governing contract: ADR 0161, ADR 0128, guides/programming-model.mdx#states
 */
import { ModelState, Transition } from "@stackra/state-machine";
import { ProductStatus } from "#modules/catalogue/enums/product-status.enum";
import { ProductArchived } from "#modules/catalogue/events/product-archived.event";
import type { Product } from "#modules/catalogue/models/product.model";

/** Base of every product state; the column stores the ProductStatus case. */
export abstract class ProductState extends ModelState<Product, ProductStatus> {
  /** Whether variants of this product may be ordered; only Active says yes. */
  isSellable(): boolean {
    return false;
  }
}

/** Being set up; invisible to customers. */
export class Draft extends ProductState {
  /** The enum case this state persists as. */
  static readonly value = ProductStatus.Draft;
  /** The states this one may move to; empty means terminal. */
  static readonly transitions = () => [Active];
}

/** On sale; the only sellable state. */
export class Active extends ProductState {
  /** The enum case this state persists as. */
  static readonly value = ProductStatus.Active;
  /** The states this one may move to; empty means terminal. */
  static readonly transitions = () => [Archived];
  /** Yes: an Active product's variants may be ordered. */
  override isSellable(): boolean {
    return true;
  }
}

/** Off sale; terminal. */
export class Archived extends ProductState {
  /** The enum case this state persists as. */
  static readonly value = ProductStatus.Archived;
  /** The states this one may move to; empty means terminal. */
  static readonly transitions = () => [];
}

/**
 * Active → Archived; records `product.archived` with the variant ids so search and storefront drop
 * them without a lookup.
 */
export class Archive extends Transition<Product, Active, Archived> {
  /** `variants` must be populated by the caller; the event carries their ids. */
  handle(product: Product): Archived {
    product.record(
      new ProductArchived({ productId: product.id, variantIds: product.variants.map((v) => v.id) }),
    );
    return new Archived();
  }
}
