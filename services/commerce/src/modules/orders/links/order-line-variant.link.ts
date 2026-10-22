/**
 * Stackra file contract:
 * Purpose: the cross-module relation OrderLine → catalogue Variant, written like a model with
 *          relation properties.
 * Boundary: a link is the only place a module names another module's model. Orders stores the
 *           variant's public id; catalogue owns that table. `GraphQuery` reads both sides in one
 *           call; `pivot: true` would create a table.
 * Runtime: node
 * Governing contract: ADR 0104 (links and query.graph), ADR 0264 d7 (`links/`),
 *                     guides/programming-model.mdx#links
 */
import { Link, ManyToOne } from "@stackra/database";
import { OrderLine } from "#modules/orders/models/order-line.model";
import { Variant } from "#modules/catalogue/models/variant.model";

/**
 * Declared by the module that holds the id (orders). Gen records the `orders → catalogue` edge from
 * this file.
 */
@Link()
export class OrderLineVariantLink {
  /** The owning side; `variantId` on it is the key into the other side. */
  @Link({ relation: ManyToOne, to: () => OrderLine, key: (line) => line.variantId })
  line!: OrderLine;
  /** The referenced catalogue variant, matched by public id. */
  @Link({ relation: ManyToOne, to: () => Variant }) variant!: Variant;
}
