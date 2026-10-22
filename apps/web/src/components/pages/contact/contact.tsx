/**
 * Stackra file contract:
 * Purpose: the contact page: heading, then either the thank-you or the form with the errors
 *          ContactRoute's `submit` returned.
 * Boundary: presentation; props are `RouteComponent<typeof ContactRoute>` (`submitted` holds the
 *           submit's data, `search.plan` the plan a "contact sales" link carried).
 * Runtime: isomorphic
 * Governing contract: ADR 0165 d2 (form adapters), ADR 0128 d2
 */
import { useTranslation } from "@stackra/i18n/react";
import type { RouteComponent } from "@stackra/navigation";
import { I18n } from "#stackra/i18n";
import { ContactForm } from "#src/components/contact-form";
import type { ContactRoute } from "#src/routes/contact.route";

/** Contact page component: the thank-you or the form with the errors the submit returned. */
export const ContactPage: RouteComponent<typeof ContactRoute> = ({ submitted, search }) => {
  const { t } = useTranslation();
  return (
    <section className="mx-auto max-w-xl">
      <h1 className="text-3xl font-semibold tracking-tight">{t(I18n.web.contact.title)}</h1>
      <p className="mt-2 text-ink-muted">{t(I18n.web.contact.subtitle)}</p>
      {submitted?.sent ? (
        <p role="status" className="mt-8 rounded-panel bg-accent/10 p-4">
          {t(I18n.web.contact.sent, submitted.sent)}
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
