/**
 * Stackra file contract:
 * Purpose: the contact form's shape and limits, validated the same way in the browser (form
 *          adapter) and in the route's `submit` (trust boundary) before the lead reaches
 *          `leads.lead.create`.
 * Boundary: one schema class, value and type under one name. Error messages are i18n keys, resolved
 *           by the field adapter and the action, never English literals.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0165 d2 (form adapters), ADR 0080
 */
import { Schema, z } from "@stackra/schema";
import { I18n } from "#stackra/i18n";

/**
 * What a visitor submits. `captchaToken` is Turnstile's; `website` is a honeypot that must stay
 * empty; `plan` is the
 * plan key a "contact sales" link carried, for analytics only.
 */
export class ContactInput extends Schema(
  z.object({
    name: z.string().trim().min(2, I18n.web.contact.errors.name).max(120),
    email: z.string().trim().email(I18n.web.contact.errors.email).max(254),
    company: z.string().trim().max(120).optional(),
    // the marketing service's own limit, repeated so the form says so first
    message: z.string().trim().min(12, I18n.web.contact.errors.message).max(2_000),
    consent: z.literal(true, { error: I18n.web.contact.errors.consent }),
    captchaToken: z.string().min(1),
    website: z.string().max(0).optional(),
    plan: z.string().max(64).optional(),
  }),
) {
  /** The longest message the lead record stores; the textarea's `maxLength`. */
  static readonly MESSAGE_MAX = 2_000;
}
