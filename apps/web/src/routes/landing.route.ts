/**
 * Stackra file contract:
 * Purpose: `/`: the home page: hero, features, the plan ladder, testimonials, FAQ and a closing
 *          call to action. Prerendered per locale at build; the loader runs then, against the
 *          public API.
 * Boundary: options are the declaration; the body loads data and builds the head. The loader is
 *           composite (three queries with the site's id), so it is a `loader`, not `prefetch`.
 *           Testimonials and FAQ are content entries of the `@stackra/content` entry types, never
 *           string type names.
 * Runtime: isomorphic
 * Governing contract: ADR 0114 d5 (prerender), ADR 0116 (content types), ADR 0242 (plan ladder)
 */
import { ContentEntryType } from "@stackra/content";
import { Route, type MetaContext, type RouteContext } from "@stackra/navigation";
import { OgKind, type Seo } from "@stackra/seo";
import { Billing, Content } from "#stackra/clients";
import { I18n } from "#stackra/i18n";
import { LandingPage } from "#src/components/pages/landing";
import { SiteConfig } from "#src/config/site.config";
import { CacheProfile } from "#src/enums/cache-profile.enum";
import { SiteLayout } from "#src/routes/site.layout";

/** Testimonials shown on the landing page. */
const TESTIMONIALS_SHOWN = 3;

/** Route `/`: the home page of hero, features, plans, testimonials, FAQ and call to action. */
@Route({
  path: "/",
  layout: SiteLayout,
  title: I18n.web.hero.title,
  prerender: true,
  cache: CacheProfile.Marketing,
  component: LandingPage,
})
export class LandingRoute {
  /**
   * Plans, testimonials and FAQ in parallel; nothing here is personal, so the result is safe to
   * prerender.
   */
  async loader(ctx: RouteContext) {
    const { siteId } = ctx.site;
    const [ladder, testimonials, faq] = await Promise.all([
      ctx.query(Billing.queries.ListPlans, { product: ctx.config(SiteConfig).product }),
      ctx.query(Content.queries.ListEntries, {
        siteId,
        type: ContentEntryType.Testimonial,
        limit: TESTIMONIALS_SHOWN,
      }),
      ctx.query(Content.queries.ListEntries, { siteId, type: ContentEntryType.Faq }),
    ]);
    return { ladder, testimonials: testimonials.entries, faq: faq.entries };
  }

  /**
   * Description and the site's OG image; Organization and FAQPage structured data. The title is
   * the static option; canonical, hreflang and the site name are derived by the adapter.
   */
  meta({ data, site, t }: MetaContext<LandingRoute>): Seo {
    const image = `${site.origin}/og/${OgKind.Site.value}/${site.siteId}`;
    const answers = data.faq.map((entry) => ({
      "@type": "Question",
      name: entry.fields.question,
      acceptedAnswer: { "@type": "Answer", text: entry.fields.answer },
    }));
    return {
      description: t(I18n.web.hero.subtitle),
      image,
      jsonLd: [
        { "@type": "Organization", name: site.name, url: site.origin, logo: image },
        { "@type": "FAQPage", mainEntity: answers },
      ],
    };
  }
}
