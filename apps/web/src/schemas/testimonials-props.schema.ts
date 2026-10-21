/**
 * Stackra file contract:
 * Purpose: the props of the `web.testimonials` block: the heading and how many quotes to show; the
 *          quotes come from the `testimonial` content type through `accepts`.
 * Boundary: one schema class.
 * Runtime: isomorphic
 * Governing contract: ADR 0110 d6, ADR 0095
 */
import { LocalizedText } from "@stackra/experience";
import { Schema, z } from "@stackra/schema";

/** The heading and a cap of one to twelve quotes. */
export class TestimonialsProps extends Schema(
  z.object({ title: LocalizedText.schema, limit: z.number().int().min(1).max(12).default(3) }),
) {}
