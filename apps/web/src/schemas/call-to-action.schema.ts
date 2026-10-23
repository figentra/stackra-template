/**
 * Stackra file contract:
 * Purpose: one call to action inside a block's props: a localised label and the route key it opens.
 * Boundary: a shape class shared by the hero and banner blocks; the target is a route key, never a
 *           URL, so a published document cannot send a visitor off the site. The route check runs
 *           when a document is parsed, not at import, because the route tree imports the blocks
 *           that use it.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 6), ADR 0110 d6 (validated block props)
 */
import type { LocalizedText } from "@stackra/experience";
import { Field, Schema } from "@stackra/validation";
import { z } from "zod";
import { Routes, type RouteKey } from "#stackra/routes";

/** A label per locale and one of the site's route keys. */
export class CallToAction extends Schema {
  /** The button's label, one value per locale. */
  label!: LocalizedText;

  /** The route the button opens, in the visitor's locale mount. */
  // reason: route keys are the keys of the generated `Routes`, read when a document is parsed; a
  // literal union here would tie the shape to gen output and fail gen
  @Field(z.custom<RouteKey>((key) => typeof key === "string" && Object.hasOwn(Routes, key)))
  route!: RouteKey;
}
