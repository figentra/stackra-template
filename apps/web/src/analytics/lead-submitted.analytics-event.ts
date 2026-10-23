/**
 * Stackra file contract:
 * Purpose: the analytics event of an accepted contact-form submission, with the plan the visitor
 *          came from; the contact page records it once the route's `submit` answered `sent`.
 * Boundary: a class per event, its fields the payload; the `name` is written once and locked in
 *           `stackra.manifest.json`. Sent only after the visitor granted the analytics consent
 *           category (fired earlier, it waits in the package's queue), and never with the visitor's
 *           name or email (the analytics config strips them too).
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 5 and 14), ADR 0298 (decision 5)
 */
import { AnalyticsEvent } from "@stackra/analytics";

/** `analytics.track(LeadSubmitted.create({ plan }))` from the contact page. */
export class LeadSubmitted extends AnalyticsEvent({ name: "lead.submitted" }) {
  /** The plan key the visitor arrived with; empty from the plain contact page. */
  plan!: string;
}
