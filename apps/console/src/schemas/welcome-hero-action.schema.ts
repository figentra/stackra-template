/**
 * Stackra file contract:
 * Purpose: the one call to action of the `console.welcome_hero` block: a label key and the route it
 *          opens.
 * Boundary: a shape class nested in the block's props. Text arrives as an i18n key, never markup;
 *           the target is a route key of this app, never a URL, so a published document cannot
 *           send a user off the app. The route check runs when a document is parsed, not at import.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 6), ADR 0110 d6, ADR 0112 (no raw HTML)
 */
import type { I18nKey } from "@stackra/i18n";
import { Field, Schema } from "@stackra/validation";
import { z } from "zod";
import { Routes, type RouteKey } from "#stackra/routes";

/** A label key and one of the console's route keys. */
export class WelcomeHeroAction extends Schema {
  /** The button's label, as an i18n key the document references. */
  labelKey!: I18nKey;

  /** The route the button opens. */
  // reason: route keys are the keys of the generated `Routes`, read when a document is parsed; a
  // literal union here would tie the shape to gen output and fail gen
  @Field(z.custom<RouteKey>((key) => typeof key === "string" && Object.hasOwn(Routes, key)))
  route!: RouteKey;
}
