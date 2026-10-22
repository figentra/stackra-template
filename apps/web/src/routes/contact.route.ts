/**
 * Stackra file contract:
 * Purpose: `/contact`: a progressively enhanced form (works without JavaScript) whose `submit`
 *          validates with the schema class, verifies the Turnstile token with the Worker's secret,
 *          and creates a lead.
 * Boundary: `submit` is the trust boundary: it never trusts the browser's validation, never echoes
 *           the secret, and maps the service's refusal codes to i18n keys. Prerendered (the GET is
 *           static); the POST always reaches the Worker.
 * Runtime: isomorphic
 * Governing contract: ADR 0165 d2 (form adapters), ADR 0140 (refusal codes → messages)
 */
import { isRefusal } from "@stackra/errors";
import { Route, type MetaContext, type RouteContext } from "@stackra/navigation";
import type { Seo } from "@stackra/seo";
import { Marketing } from "#stackra/clients";
import { I18n } from "#stackra/i18n";
import { ContactPage } from "#src/components/pages/contact";
import { CacheProfile } from "#src/enums/cache-profile.enum";
import { ContactInput } from "#src/schemas/contact.schema";
import { ContactSearch } from "#src/schemas/contact-search.schema";
import { SiteLayout } from "#src/routes/site.layout";

/** Route `/contact`: a progressively enhanced contact form whose submit validates its input. */
@Route({
  path: "/contact",
  layout: SiteLayout,
  title: I18n.web.contact.title,
  search: ContactSearch,
  prerender: true,
  cache: CacheProfile.Marketing,
  component: ContactPage,
})
export class ContactRoute {
  /**
   * Parse → verify captcha → create lead. 400 with field errors, 422 with a form error, 200 with
   * `sent`.
   */
  async submit(ctx: RouteContext) {
    const parsed = ContactInput.safeParse(await ctx.formData());
    if (!parsed.success) return ctx.fieldErrors(parsed.error);
    const { captchaToken, website: _honeypot, plan: _plan, ...lead } = parsed.data;

    const verified = await ctx.captcha.verify(captchaToken, ctx.env.turnstileSecret);
    if (!verified)
      return ctx.data({ formError: I18n.leads.refusals.captcha_failed }, { status: 422 });

    try {
      await ctx.action(Marketing.actions.CreateLead, {
        ...lead,
        locale: ctx.site.locale,
        captchaToken,
      });
      return ctx.data({ sent: { name: lead.name, email: lead.email } });
    } catch (error) {
      if (isRefusal(error, Marketing.refusals.rate_limited)) {
        return ctx.data({ formError: I18n.leads.refusals.rate_limited }, { status: 422 });
      }
      throw error; // a transport failure is the error page, with its reference
    }
  }

  /** The description; the title is the static option, canonical and hreflang are derived. */
  meta({ t }: MetaContext<ContactRoute>): Seo {
    return { description: t(I18n.web.contact.subtitle) };
  }
}
