/**
 * Stackra file contract:
 * Purpose: `/pricing`: the full ladder with the interval toggle, the FAQ, and `Product`/`Offer`
 *          structured data so search engines show the plans. Prerendered per locale; the
 *          yearly-first experiment runs in the browser.
 * Boundary: composition only; the table, the interval and the experiment arm are the pricing-table
 *           component's, and gen finds the experiment from that component's `#stackra/flags`
 *           import. Offer prices are decimal strings from `@stackra/money`, never hand-divided
 *           minor units.
 * Runtime: isomorphic
 * Governing contract: ADR 0242 (plan ladders), ADR 0220 (money), ADR 0213 d3 (flags)
 */
import { ContentEntryType } from "@stackra/content";
import { Money } from "@stackra/money";
import { Route, type MetaContext, type RouteContext } from "@stackra/navigation";
import { OgKind, type Seo } from "@stackra/seo";
import { Billing, Content } from "#stackra/clients";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";
import { PricingPage } from "#src/components/pages/pricing";
import { SiteConfig } from "#src/config/site.config";
import { CacheProfile } from "#src/enums/cache-profile.enum";
import { SiteLayout } from "#src/routes/site.layout";

/** FAQ entries shown under the ladder. */
const FAQ_SHOWN = 6;

/**
 * Route `/pricing`: the plan ladder with interval toggle, FAQ and `Product`/`Offer` structured
 * data.
 */
@Route({
  path: "/pricing",
  layout: SiteLayout,
  title: I18n.web.pricing.title,
  prerender: true,
  cache: CacheProfile.Marketing,
  component: PricingPage,
})
export class PricingRoute {
  /** The ladder for the site's product and the FAQ, in parallel. */
  async loader(ctx: RouteContext) {
    const [ladder, faq] = await Promise.all([
      ctx.query(Billing.queries.ListPlans, { product: ctx.config(SiteConfig).product }),
      ctx.query(Content.queries.ListEntries, {
        siteId: ctx.site.siteId,
        type: ContentEntryType.Faq,
        limit: FAQ_SHOWN,
      }),
    ]);
    return { ladder, faq: faq.entries };
  }

  /**
   * One `Offer` per priced plan in the market currency; enterprise (no price) is left out, never
   * priced at 0.
   */
  meta({ data, site, t, href }: MetaContext<PricingRoute>): Seo {
    const page = `${site.origin}${href(Routes.pricing)}`;
    const offers = data.ladder.plans.flatMap((plan) =>
      plan.prices.month === null
        ? []
        : [
            {
              "@type": "Offer",
              name: plan.name,
              price: Money.ofMinor(plan.prices.month, plan.currency).toDecimal(),
              priceCurrency: plan.currency,
              url: `${page}#${plan.key}`,
            },
          ],
    );
    return {
      description: t(I18n.web.pricing.subtitle, { days: data.ladder.trialDays }),
      image: `${site.origin}/og/${OgKind.Page.value}/pricing`,
      jsonLd: [{ "@type": "Product", name: site.name, offers }],
    };
  }
}
