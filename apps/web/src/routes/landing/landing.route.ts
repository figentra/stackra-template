/**
 * Stackra file contract:
 * Purpose: `/`: the home page: hero, features, the plan ladder, testimonials, FAQ and a closing
 *          call to action. Its page is `landing.tsx` beside it, bound by name.
 * Boundary: the loader is composite (three queries with the site's id) and each query names the
 *           `marketing` cache profile, so the data is cached per site, locale and market while the
 *           HTML stays private (ADR 0297 d3). The page is rendered on the Worker per request, never
 *           prerendered: the site comes from the host, and prerendering needs a fixed site (ADR
 *           0297 d2). Testimonials and FAQ are content entries of the `@stackra/content` entry
 *           types, never string type names. The static `seo` title reuses the hero heading's key;
 *           canonical, hreflang and the site name are derived.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 14, 16 and 17), ADR 0297 (decisions 2 and 3), ADR 0301
 *                     (decision 7: the SEO chain), ADR 0116 (content types), ADR 0242 (plan ladder)
 */
import { ContentEntryType } from "@stackra/content";
import { Route, type MetaContext, type RouteContext } from "@stackra/navigation";
import { OgKind, type Seo } from "@stackra/seo";
import { Billing, Content } from "#stackra/clients";
import { I18n } from "#stackra/i18n";
import type { SiteConfig } from "#src/config/site.config";
import { CacheProfile } from "#src/enums/cache-profile.enum";
import { SiteLayout } from "#src/routes/site/site.layout";

/** Testimonials shown on the landing page. */
const TESTIMONIALS_SHOWN = 3;

/** Route `/`: the home page of hero, features, plans, testimonials, FAQ and call to action. */
export class LandingRoute extends Route({
  path: "/",
  layout: SiteLayout,
  seo: { title: I18n.web.hero.title },
}) {
  /** @param site - the site config; its `product` names the plan ladder the page sells. */
  constructor(private readonly site: SiteConfig) {
    super();
  }

  /** Plans, testimonials and FAQ in parallel; nothing here is personal. */
  override async loader(ctx: RouteContext<this>) {
    const { siteId } = ctx.site;
    const cache = { cache: CacheProfile.Marketing };
    const [ladder, testimonials, faq] = await Promise.all([
      ctx.query(Billing.queries.ListPlans, { product: this.site.product }, cache),
      ctx.query(
        Content.queries.ListEntries,
        { siteId, type: ContentEntryType.Testimonial, limit: TESTIMONIALS_SHOWN },
        cache,
      ),
      ctx.query(Content.queries.ListEntries, { siteId, type: ContentEntryType.Faq }, cache),
    ]);
    return { ladder, testimonials: testimonials.entries, faq: faq.entries };
  }

  /**
   * Description and the site's OG image; Organization and FAQPage structured data, escaped by the
   * adapter. The title is the static `seo`; canonical, hreflang and the site name are derived.
   */
  override meta({ data, site, t }: MetaContext<this>): Seo {
    const image = `${site.origin}/og/${OgKind.Site}/${site.siteId}`;
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
