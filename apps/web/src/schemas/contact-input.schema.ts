/**
 * Stackra file contract:
 * Purpose: the contact form's shape and limits, validated the same way in the browser (form
 *          adapter) and in the route's `submit` (trust boundary) before the lead reaches
 *          `leads.lead.create`.
 * Boundary: a shape class; gen compiles it to the one schema both sides read. Error messages are
 *           i18n keys, resolved by the field adapter and the action, never English literals.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 6), ADR 0095, ADR 0165 d2 (form adapters),
 *                     ADR 0080
 */
import { Field, Schema, Str, Trim } from "@stackra/validation";
import { z } from "zod";
import { I18n } from "#stackra/i18n";

/**
 * What a visitor submits. `captchaToken` is Turnstile's; `website` is a honeypot that must stay
 * empty; `plan` is the plan key a "contact sales" link carried, for analytics only.
 */
export class ContactInput extends Schema {
  /** The longest message the lead record stores; the textarea's `maxLength`. */
  static readonly MESSAGE_MAX = 2_000;

  /** The visitor's name. */
  @Trim
  @Str({
    min: 2,
    max: 120,
    message: I18n.web.contact.errors.name,
  })
  name!: string;

  /** Where the reply goes. */
  // reason: an email format with its own i18n message; `@Str` carries length and pattern only
  @Field(z.string().trim().email(I18n.web.contact.errors.email).max(254))
  email!: string;

  /** The visitor's company, when they give one. */
  @Trim
  @Str({ max: 120 })
  company?: string;

  /** What they need; the marketing service's own limit, repeated so the form says so first. */
  @Trim
  @Str({
    min: 12,
    max: 2_000,
    message: I18n.web.contact.errors.message,
  })
  message!: string;

  /** The privacy consent checkbox, which must be ticked. */
  // reason: only `true` passes; a literal type would fail gen, so the field stays `boolean`
  @Field(z.literal(true, { error: I18n.web.contact.errors.consent }))
  consent!: boolean;

  /** Turnstile's token, verified by the route's `submit`. */
  @Str({ min: 1 })
  captchaToken!: string;

  /** The honeypot: hidden from people, so anything in it marks a bot. */
  @Str({ max: 0 })
  website?: string;

  /** The plan key a "contact sales" link carried. */
  @Str({ max: 64 })
  plan?: string;
}
