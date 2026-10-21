/**
 * Stackra file contract:
 * Purpose: the props of the `web.hero` block: what a document may pass, validated on publish and on
 *          render.
 * Boundary: one schema class; text is `LocalizedText` (one value per locale), actions are route
 *           keys.
 * Runtime: isomorphic
 * Governing contract: ADR 0110 d6, ADR 0095
 */
import { LocalizedText } from "@stackra/experience";
import { Schema, z } from "@stackra/schema";
import { CallToAction } from "#src/schemas/call-to-action.schema";

/** Headline, one sentence under it, a primary and an optional secondary action. */
export class HeroProps extends Schema(
  z.object({
    title: LocalizedText.schema,
    subtitle: LocalizedText.schema,
    cta: CallToAction.schema,
    secondary: CallToAction.schema.optional(),
  }),
) {}
