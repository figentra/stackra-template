/**
 * Stackra file contract:
 * Purpose: one call to action inside a block's props: a localised label and the route key it opens.
 * Boundary: one schema class; the target is a `RouteKey`, never a URL, so a published document
 *           cannot send a visitor off the site. Checked at parse time, because the route tree
 *           imports the blocks that use it.
 * Runtime: isomorphic
 * Governing contract: ADR 0110 d6 (validated block props), ADR 0095
 */
import { LocalizedText } from "@stackra/experience";
import { Schema, z } from "@stackra/schema";
import { Routes, type RouteKey } from "#stackra/routes";

/** A label per locale and one of the site's route keys. */
export class CallToAction extends Schema(
  z.object({
    label: LocalizedText.schema,
    route: z.custom<RouteKey>((key) => typeof key === "string" && Object.hasOwn(Routes, key)),
  }),
) {}
