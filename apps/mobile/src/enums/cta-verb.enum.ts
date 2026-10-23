/**
 * Stackra file contract:
 * Purpose: the closed verbs a block's call to action may carry: navigate to a route of this app, or
 *          run an action by key. Never a URL to arbitrary code.
 * Boundary: an enum (`Enum.of`): each case is the discriminant of one event schema
 *           (`NavigateEvent`, `ActionEvent`), so the union of the two compiles to a discriminated
 *           union. The label is the derived key `mobile::enums.cta_verb.<code>`, which the page
 *           builder shows when a tenant picks a verb.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 16 and 26), ADR 0110, ADR 0112
 */
import { Enum } from "@stackra/contracts";

/** The verb of a call to action; the renderer maps navigate to the router and action to a call. */
export const CtaVerb = Enum.of({
  /** Open a route of this app by its key. */
  Navigate: "navigate",
  /** Run an action by its key through the client. */
  Action: "action",
});

/** One of the codes above. */
export type CtaVerb = Enum.Value<typeof CtaVerb>;
