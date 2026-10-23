/**
 * Stackra file contract:
 * Purpose: the navigate verb of a call to action: open a route of this app by its key.
 * Boundary: a schema class, one side of the discriminated union `PromoBannerCta.event`; `verb` is
 *           the discriminant. The route is a generated route key, so a URL never passes and a
 *           removed route fails gen.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26), ADR 0110, ADR 0112
 */
import { Schema } from "@stackra/validation";
import type { CtaVerb } from "#src/enums/cta-verb.enum";
import type { RouteKey } from "#stackra/routes";

/** `{ verb: CtaVerb.Navigate, route: RouteKey.CreateOrder }` opens the create-order sheet. */
export class NavigateEvent extends Schema {
  /** The discriminant: always `navigate`. */
  verb!: typeof CtaVerb.Navigate;

  /** The route to open, by its generated key. */
  route!: RouteKey;
}
