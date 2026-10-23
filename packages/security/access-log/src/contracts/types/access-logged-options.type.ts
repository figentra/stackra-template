/**
 * Stackra file contract:
 * Purpose: what the `@AccessLogged(...)` class facet takes; read by the Explorer at bootstrap and
 *          by gen from the syntax tree.
 * Boundary: a type in the leaf entry. Every value is a literal, because gen reads decorator
 *           arguments statically: the subject is a field name, never a callback.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 6, 8 and 15), ADR 0144 (metadata registry), ADR 0134
 */
import type { DataClassification } from "#contracts/enums/data-classification.enum";

/** The facet's options. */
export interface AccessLoggedOptions {
  /** Classification of the data the class exposes. */
  readonly classification: DataClassification;

  /**
   * A field of the model records the class handles (`"customerId"`): each call is logged against
   * that field of every record among its arguments and its result. Omitted, each call is logged
   * against the principal the call is for (the actor, or the customer a service acts for).
   */
  readonly subjects?: string;
}
