/**
 * Stackra file contract:
 * Purpose: the analytics event a visitor's contact-form submission records, with the plan they came
 *          from.
 * Boundary: a class per event; sent only after the visitor granted the analytics consent category,
 *           and never with the visitor's name or email (the analytics config strips them too).
 * Runtime: browser
 * Governing contract: ADR 0071 d6 (no personal data without consent)
 */
import { AnalyticsEvent } from "@stackra/analytics";

/**
 * `lead.submitted`: `plan` is the plan key the visitor arrived with, empty from the plain contact
 * page.
 */
@AnalyticsEvent({ name: "lead.submitted" })
export class LeadSubmitted extends AnalyticsEvent<{ plan: string }> {}
