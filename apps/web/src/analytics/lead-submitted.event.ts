/**
 * Stackra file contract:
 * Purpose: the analytics event of an accepted contact-form submission, with the plan the visitor
 *          came from; the contact page records it once the route's `submit` answered `sent`.
 * Boundary: a class per event; sent only after the visitor granted the analytics consent category,
 *           and never with the visitor's name or email (the analytics config strips them too).
 * Runtime: browser
 * Governing contract: the `@stackra/analytics` package contract
 */
import { AnalyticsEvent } from "@stackra/analytics";

/**
 * `lead.submitted`: `plan` is the plan key the visitor arrived with, empty from the plain contact
 * page.
 */
@AnalyticsEvent({ name: "lead.submitted" })
export class LeadSubmitted extends AnalyticsEvent<{ plan: string }> {}
