/**
 * Stackra file contract:
 * Purpose: the contact page: heading, then either the thank-you or the form with the errors
 *          ContactRoute's `submit` returned; the thank-you records the `LeadSubmitted` analytics
 *          event once, because only then does a lead exist.
 * Boundary: presentation; props are `RouteComponent<typeof ContactRoute>` (`submitted` holds the
 *           submit's data, `search.plan` the plan a "contact sales" link carried). The event
 *           carries the plan, never the visitor's name or email; the analytics package drops it
 *           without consent.
 * Runtime: isomorphic
 * Governing contract: ADR 0165 d2 (form adapters)
 */
import { useEffect } from "react";
import { useAnalytics } from "@stackra/analytics/react";
import { useTranslation } from "@stackra/i18n/react";
import type { RouteComponent } from "@stackra/navigation";
import { I18n } from "#stackra/i18n";
import { LeadSubmitted } from "#src/analytics/lead-submitted.event";
import { ContactForm } from "#src/components/contact-form";
import type { ContactRoute } from "#src/routes/contact.route";

/** Contact page component: the thank-you or the form with the errors the submit returned. */
export const ContactPage: RouteComponent<typeof ContactRoute> = ({ submitted, search }) => {
  const { t } = useTranslation();
  const analytics = useAnalytics();
  const sent = submitted?.sent;
  const plan = search.plan ?? "";
  // once per accepted submission, after commit; a refusal or a field error records nothing
  useEffect(() => {
    if (sent) analytics.track(new LeadSubmitted({ plan }));
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
        />
      )}
    </section>
  );
};
