/**
 * Stackra file contract:
 * Purpose: the props of the `web.cta` block: what a document may pass, validated on publish and on
 *          render.
 * Boundary: one schema class; text is `LocalizedText`, the button is a route key.
 * Runtime: isomorphic
 * Governing contract: ADR 0110 d6, ADR 0095
 */
import { LocalizedText } from "@stackra/experience";
import { Schema, z } from "@stackra/schema";
import { CallToAction } from "#src/schemas/call-to-action.schema";

/** A title, a line and the one button. */
export class CtaProps extends Schema(
  z.object({
    title: LocalizedText.schema,
    body: LocalizedText.schema,
    button: CallToAction.schema,
  }),
) {}
