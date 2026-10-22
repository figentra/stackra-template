/**
 * Stackra file contract:
 * Purpose: the props of the `web.faq` block; the questions come from the `faq` content type through
 *          `accepts`.
 * Boundary: one schema class; only the heading is the document's.
 * Runtime: isomorphic
 * Governing contract: ADR 0110 d6, ADR 0095
 */
import { LocalizedText } from "@stackra/experience";
import { Schema, z } from "@stackra/schema";

/** The section heading. */
export class FaqProps extends Schema(z.object({ title: LocalizedText.schema })) {}
