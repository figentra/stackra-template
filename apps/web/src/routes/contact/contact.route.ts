/**
 * Stackra file contract:
 * Purpose: `/contact`: a progressively enhanced form (works without JavaScript) whose `submit`
 *          validates with the shape class, verifies the Turnstile token with the Worker's secret,
 *          and creates a lead. Its page is `contact.tsx` beside it, bound by name.
 * Boundary: `submit` is the trust boundary: it never trusts the browser's validation, never echoes
 *           the secret, and maps the service's refusal codes to i18n keys. The GET has no loader,
 *           so there is nothing to cache; rendered per request like every page of a site resolved
 *           from its host, and the POST always reaches the Worker. The static `seo` title reuses
 *           the page heading's key.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0165 d2 (form adapters), ADR 0140
 *                     (refusal codes → messages), ADR 0301 (decision 7)
 */
import { isRefusal } from "@stackra/errors";
import { Route, type MetaContext, type RouteContext } from "@stackra/navigation";
import type { Seo } from "@stackra/seo";
import { validate } from "@stackra/validation";
import { CreateLeadAction, RateLimitedError } from "#stackra/clients/marketing";
import { I18n } from "#stackra/i18n";
import { SiteLayout } from "#src/routes/site/site.layout";
import { ContactInput } from "#src/schemas/contact-input.schema";
import { ContactSearch } from "#src/schemas/contact-search.schema";

/** Route `/contact`: a progressively enhanced contact form whose submit validates its input. */
export class ContactRoute extends Route({
  path: "/contact",
  layout: SiteLayout,
  search: ContactSearch,
  seo: { title: I18n.web.contact.title },
}) {
  /**
   * Parse → verify captcha → create lead. 400 with field errors, 422 with a form error, 200 with
   * `sent`.
   */
  override async submit(ctx: RouteContext<this>) {
    const parsed = validate(ContactInput, await ctx.formData());
    if (!parsed.success) return ctx.fieldErrors(parsed.error);
    const { captchaToken, website: _honeypot, plan: _plan, ...lead } = parsed.data;

    const verified = await ctx.captcha.verify(captchaToken, ctx.env.turnstileSecret);
    if (!verified)
      return ctx.data({ formError: I18n.leads.refusals.captcha_failed }, { status: 422 });

    const result = await ctx.action(CreateLeadAction, {
      ...lead,
      locale: ctx.site.locale,
      captchaToken,
    });
    if (result.ok) return ctx.data({ sent: { name: lead.name, email: lead.email } });
    if (isRefusal(result.error, RateLimitedError)) {
      return ctx.data({ formError: I18n.leads.refusals.rate_limited }, { status: 422 });
    }
    throw result.error; // a transport failure is the error page, with its reference
  }

  /** The description; the title is the static `seo`, canonical and hreflang are derived. */
  override meta({ t }: MetaContext<this>): Seo {
    return { description: t(I18n.web.contact.subtitle) };
  }
}
