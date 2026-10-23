/**
 * Stackra file contract:
 * Purpose: the contact form: a React Router `<RouteForm method="post">` (works without JavaScript)
 *          whose fields are the @stackra/ui adapters over the schema, so the browser shows the same
 *          messages the route's `submit` returns.
 * Boundary: UI and client-side validation only; `ContactRoute.submit` is the authority. Server
 *           field errors arrive as props and show immediately; the Turnstile widget supplies
 *           `captchaToken`. The form records no analytics: a lead exists only once the server
 *           accepted it, so the contact page records `LeadSubmitted` from the submit's answer.
 * Runtime: browser
 * Governing contract: ADR 0294 d14, ADR 0165 decision 2 (form adapters live in @stackra/ui), ADR
 *                     0055
 */
import { useTranslation } from "@stackra/i18n/react";
import { RouteForm, useNavigation } from "@stackra/navigation/react";
import { Button } from "@stackra/ui";
import { CheckboxField, TextAreaField, TextField, useSchemaForm } from "@stackra/ui/form";
import { Turnstile } from "@stackra/ui/turnstile";
import { I18n, type I18nKey } from "#stackra/i18n";
import { ContactInput } from "#src/schemas/contact-input.schema";

/** What the route passes back after a POST, and where the visitor came from. */
export interface ContactFormProps {
  /** Field name → i18n key, from the submit's 400. */
  readonly fieldErrors?: Readonly<Record<string, I18nKey>>;
  /** An i18n key for a form-level refusal, from the submit's 422. */
  readonly formError?: I18nKey;
  /** The plan key from `?plan=` when the visitor came from "contact sales". */
  readonly plan?: string;
}

/** The adapter validates on submit; a valid form posts natively, an invalid one never leaves. */
export function ContactForm({ fieldErrors, formError, plan = "" }: ContactFormProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const form = useSchemaForm(ContactInput, { serverErrors: fieldErrors });

  return (
    <RouteForm
      method="post"
      className="mt-8 flex flex-col gap-4"
      aria-label={t(I18n.web.contact.title)}
      onSubmit={form.handleNativeSubmit()}
    >
      <TextField
        {...form.field("name")}
        label={t(I18n.web.contact.name)}
        autoComplete="name"
        isRequired
      />
      <TextField
        {...form.field("email")}
        label={t(I18n.web.contact.email)}
        type="email"
        autoComplete="email"
        isRequired
      />
      <TextField
        {...form.field("company")}
        label={t(I18n.web.contact.company)}
        autoComplete="organization"
      />
      <TextAreaField
        {...form.field("message")}
        label={t(I18n.web.contact.message)}
        maxLength={ContactInput.MESSAGE_MAX}
        rows={5}
        isRequired
      />
      <CheckboxField {...form.field("consent")}>{t(I18n.web.contact.consent)}</CheckboxField>
      {/* Honeypot: hidden from people and assistive tech; a bot that fills it fails the schema. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />
      <input type="hidden" name="plan" value={plan} />
      <Turnstile name="captchaToken" />
      {formError && (
        <p role="alert" className="text-danger">
          {t(formError)}
        </p>
      )}
      <Button type="submit" isPending={navigation.state === "submitting"}>
        {t(I18n.web.contact.submit)}
      </Button>
    </RouteForm>
  );
}
