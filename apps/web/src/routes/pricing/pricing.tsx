/**
 * Stackra file contract:
 * Purpose: the pricing page, bound to `PricingRoute` by name: heading, the ladder, the FAQ, from
 *          what the route loaded.
 * Boundary: composition only; the product sold comes from the site config through `useConfig`, the
 *           interval and the experiment are the pricing table's.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 7 and 14, as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0242 (plan ladders)
 */
import { useConfig } from "@stackra/config/react";
import { useTranslation } from "@stackra/i18n/react";
import type { RouteProps } from "@stackra/navigation";
import { Component } from "#stackra/ui";
import { I18n } from "#stackra/i18n";
import { FaqSection } from "#src/blocks/faq-section/faq-section";
import { PricingTable } from "#src/blocks/pricing-table/pricing-table";
import { SiteConfig } from "#src/config/site.config";
import type { PricingRoute } from "#src/routes/pricing/pricing.route";

/** Heading, plan ladder and FAQ from what the route loaded. */
export class Pricing extends Component<RouteProps<typeof PricingRoute>> {
  /** The translator of the visitor's locale. */
  translation = useTranslation();

  /** The site config; its `product` names the ladder the page sells. */
  site = useConfig(SiteConfig);

  /** The heading with the trial line, the ladder and the FAQ. */
  render() {
    const { t } = this.translation;
    const { data } = this.props;
    return (
      <>
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-semibold tracking-tight">{t(I18n.web.pricing.title)}</h1>
          <p className="mt-3 text-lg text-ink-muted">
            {t(I18n.web.pricing.subtitle, { days: data.ladder.trialDays })}
          </p>
        </header>
        <PricingTable data={data.ladder} product={this.site.product} />
        <FaqSection title={t(I18n.web.faq.title)} data={{ entries: data.faq }} />
      </>
    );
  }
}
