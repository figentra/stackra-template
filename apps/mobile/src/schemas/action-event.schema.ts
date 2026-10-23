/**
 * Stackra file contract:
 * Purpose: the action verb of a call to action: run an action by its key through the client.
 * Boundary: a schema class, one side of the discriminated union `PromoBannerCta.event`; `verb` is
 *           the discriminant. The renderer dispatches the key through the generated client, which
 *           applies the action's permission, confirmation and Idempotency-Key; a key the app does
 *           not consume is refused.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26), ADR 0110, ADR 0112
 */
import { Schema, Str } from "@stackra/validation";
import type { CtaVerb } from "#src/enums/cta-verb.enum";

/** `{ verb: CtaVerb.Action, key: "orders.order.create@1" }` runs that action. */
export class ActionEvent extends Schema {
  /** The discriminant: always `action`. */
  verb!: typeof CtaVerb.Action;

  /** The action's key, with its major (`<module>.<aggregate>.<verb>@<n>`). */
  @Str({ min: 1 })
  key!: string;
}
