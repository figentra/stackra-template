/**
 * Stackra file contract:
 * Purpose: `/pricing`: the full ladder with the interval toggle, the FAQ, and `Product`/`Offer`
 *          structured data so search engines show the plans. Its page is `pricing.tsx` beside it;
 *          the yearly-first experiment runs in the browser.
 * Boundary: composition only; the table, the interval and the experiment arm are the pricing-table
 *           block's, and gen finds the experiment from that block's `#stackra/flags` import. The
 *           queries name the `marketing` cache profile, so the data is cached per site, locale and
 *           market while the HTML stays private; rendered per request, never prerendered (the site
 *           comes from the host). Offer prices are decimal strings from `@stackra/money`, never
 *           hand-divided minor units.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 14, 16 and 17), ADR 0297 (decisions 2 and 3), ADR 0301
 *                     (decision 7), ADR 0242 (plan ladders), ADR 0220 (money), ADR 0213 d3 (flags)
 */
import { ContentEntryType } from "@stackra/content";
import { Money } from "@stackra/money";
import { Route, type MetaContext, type RouteContext } from "@stackra/navigation";
import { OgKind, type Seo } from "@stackra/seo";
import { ListPlansQuery } from "#stackra/clients/billing";
import { ListEntriesQuery } from "#stackra/clients/content";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";
import type { SiteConfig } from "#src/config/site.config";
import { CacheProfile } from "#src/enums/cache-profile.enum";
import { SiteLayout } from "#src/routes/site/site.layout";

/** FAQ entries shown under the ladder. */
const FAQ_SHOWN = 6;

/** Route `/pricing`: the plan ladder with interval toggle, FAQ and `Product`/`Offer` data. */
export class PricingRoute extends Route({
  path: "/pricing",
  layout: SiteLayout,
  seo: { title: I18n.web.pricing.title },
}) {
  /** @param site - the site config; its `product` names the plan ladder the page sells. */
  constructor(private readonly site: SiteConfig) {
    super();
  }

  /** The ladder for the site's product and the FAQ, in parallel. */
  override async loader(ctx: RouteContext<this>) {
    const cache = { cache: CacheProfile.Marketing };
    const [ladder, faq] = await Promise.all([
      ctx.query(ListPlansQuery, { product: this.site.product }, cache),
      ctx.query(
        ListEntriesQuery,
        { siteId: ctx.site.siteId, type: ContentEntryType.Faq, limit: FAQ_SHOWN },
        cache,
      ),
    ]);
    return { ladder, faq: faq.entries };
  }

  /**
   * One `Offer` per priced plan in the market currency; enterprise (no price) is left out, never
   * priced at 0.
   */
  override meta({ data, site, t, href }: MetaContext<this>): Seo {
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
      image: `${site.origin}/og/${OgKind.Page}/pricing`,
      jsonLd: [{ "@type": "Product", name: site.name, offers }],
    };
  }
}
