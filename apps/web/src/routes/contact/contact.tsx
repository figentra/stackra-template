/**
 * Stackra file contract:
 * Purpose: the contact page, bound to `ContactRoute` by name: heading, then either the thank-you or
 *          the form with the errors the route's `submit` returned; the thank-you records the
 *          `LeadSubmitted` analytics event once, because only then does a lead exist.
 * Boundary: presentation; props are `RouteProps<typeof ContactRoute>` (`submitted` holds the
 *           submit's data, `search.plan` the plan a "contact sales" link carried, `search.product`
 *           and `search.sku` the product a product page's enquiry link carried). The event
 *           carries the plan, never the visitor's name or email; before the visitor decides it
 *           waits in the analytics package's bounded queue, and a refusal drops it.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 7 and 14, as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0165 d2 (form adapters), ADR 0298 (events
 *                     wait for consent)
 */
import { useEffect } from "react";
import { useAnalytics } from "@stackra/analytics/react";
import { useTranslation } from "@stackra/i18n/react";
import type { RouteProps } from "@stackra/navigation";
import { Component } from "@stackra/ui";
import { I18n } from "#stackra/i18n";
import { LeadSubmitted } from "#src/analytics/lead-submitted.analytics-event";
import { ContactForm } from "#src/components/contact-form";
import type { ContactRoute } from "#src/routes/contact/contact.route";

/** The thank-you or the form with the errors the submit returned. */
export class Contact extends Component<RouteProps<typeof ContactRoute>> {
  /** The translator of the visitor's locale. */
  translation = useTranslation();

  /** The analytics client; events wait for consent inside it. */
  analytics = useAnalytics();

  /** The heading, then the thank-you or the form. */
  render() {
    const { t } = this.translation;
    const { submitted, search } = this.props;
    const sent = submitted?.sent;
    const plan = search.plan ?? "";
    const analytics = this.analytics;
    // once per accepted submission, after commit; a refusal or a field error records nothing
    useEffect(() => {
      if (sent) analytics.track(LeadSubmitted.create({ plan }));
    }, [sent, plan, analytics]);
    return (
      <section className="mx-auto max-w-xl">
        <h1 className="text-3xl font-semibold tracking-tight">{t(I18n.web.contact.title)}</h1>
        <p className="mt-2 text-ink-muted">{t(I18n.web.contact.subtitle)}</p>
        {sent ? (
          <p role="status" className="mt-8 rounded-panel bg-accent/10 p-4">
            {t(I18n.web.contact.sent, sent)}
          </p>
        ) : (
          <ContactForm
            fieldErrors={submitted?.fieldErrors}
            formError={submitted?.formError}
            plan={search.plan}
            product={search.product}
            sku={search.sku}
          />
        )}
      </section>
    );
  }
}
