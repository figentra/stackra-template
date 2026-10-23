/**
 * Stackra file contract:
 * Purpose: the call to action of the promo banner block: a short label and one closed verb.
 * Boundary: a schema class nested in `PromoBannerBlock`; `event` is a union of two schema classes
 *           with an enum case as the discriminant, so gen compiles it to a discriminated union.
 *           The label is tenant-authored text, already translated per locale by the experience
 *           service.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26), ADR 0110, ADR 0112
 */
import { Schema, Str } from "@stackra/validation";
import type { ActionEvent } from "#src/schemas/action-event.schema";
import type { NavigateEvent } from "#src/schemas/navigate-event.schema";

/** The button: a label and what pressing it does. */
export class PromoBannerCta extends Schema {
  /** The button text; at most 24 characters so it fits a phone button. */
  @Str({
    min: 1,
    max: 24,
  })
  label!: string;

  /** Navigate to a route of this app, or run an action by key. */
  event!: NavigateEvent | ActionEvent;
}
