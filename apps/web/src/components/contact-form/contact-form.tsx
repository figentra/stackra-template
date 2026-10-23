/**
 * Stackra file contract:
 * Purpose: the contact form: a React Router `<RouteForm method="post">` (works without JavaScript)
 *          whose fields are the @stackra/ui adapters over the schema, so the browser shows the same
 *          messages the route's `submit` returns.
 * Boundary: UI and client-side validation only; `ContactRoute.submit` is the authority. Server
 *           field errors arrive as props and show immediately; a product enquiry seeds the message
 *           with the product and SKU, which the visitor edits before sending; the Turnstile
 *           widget supplies `captchaToken`. The form records no analytics: a lead exists only once the server
 *           accepted it, so the contact page records `LeadSubmitted` from the submit's answer.
 * Runtime: browser
 * Governing contract: ADR 0294 (decision 14, as amended by programming model v3.1, AGENTS.md: class
 *                     components), ADR 0165 decision 2 (form adapters live in @stackra/ui), ADR
 *                     0055
 */
import { useTranslation } from "@stackra/i18n/react";
import { RouteForm, useNavigation } from "@stackra/navigation/react";
import {
  Button,
  CheckboxField,
  TextAreaField,
  TextField,
  Turnstile,
  useSchemaForm,
} from "@stackra/ui/react";
import { Component } from "#stackra/ui";
import { I18n } from "#stackra/i18n";
import { ContactInput } from "#src/schemas/contact-input.schema";
import type { ContactFormProps } from "./contact-form.props";

/** The adapter validates on submit; a valid form posts natively, an invalid one never leaves. */
export class ContactForm extends Component<ContactFormProps> {
  /** The translator of the visitor's locale. */
  translation = useTranslation();

  /** The router's navigation state; `submitting` while the POST is in flight. */
  navigation = useNavigation();

  /** The schema form, seeded with the server's field errors and a product enquiry's message. */
  form = useSchemaForm(ContactInput, {
    serverErrors: this.props.fieldErrors,
    defaultValues: this.props.product
      ? {
          message: this.props.sku
            ? this.translation.t(I18n.web.contact.enquiry_variant, {
                product: this.props.product,
                sku: this.props.sku,
              })
            : this.translation.t(I18n.web.contact.enquiry, { product: this.props.product }),
        }
      : undefined,
  });

  /** The fields, the honeypot, the plan, the captcha and the form-level refusal. */
  render() {
    const { t } = this.translation;
    return (
      <RouteForm
        method="post"
        className="mt-8 flex flex-col gap-4"
        aria-label={t(I18n.web.contact.title)}
        onSubmit={this.form.handleNativeSubmit()}
      >
        <TextField
          {...this.form.field("name")}
          label={t(I18n.web.contact.name)}
          autoComplete="name"
          isRequired
        />
        <TextField
          {...this.form.field("email")}
          label={t(I18n.web.contact.email)}
          type="email"
          autoComplete="email"
          isRequired
        />
        <TextField
          {...this.form.field("company")}
          label={t(I18n.web.contact.company)}
          autoComplete="organization"
        />
        <TextAreaField
          {...this.form.field("message")}
          label={t(I18n.web.contact.message)}
          maxLength={ContactInput.MESSAGE_MAX}
          rows={5}
          isRequired
        />
        <CheckboxField {...this.form.field("consent")}>{t(I18n.web.contact.consent)}</CheckboxField>
        {/* Honeypot: hidden from people and assistive tech; a bot that fills it fails the schema. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="hidden"
        />
        <input type="hidden" name="plan" value={this.props.plan ?? ""} />
        <Turnstile name="captchaToken" />
        {this.props.formError && (
          <p role="alert" className="text-danger">
            {t(this.props.formError)}
          </p>
        )}
        <Button type="submit" isPending={this.navigation.state === "submitting"}>
          {t(I18n.web.contact.submit)}
        </Button>
      </RouteForm>
    );
  }
}
