/**
 * Stackra file contract:
 * Purpose: the pricing page: heading, the ladder, the FAQ, from what PricingRoute loaded.
 * Boundary: composition only; the product sold comes from the site config through `useConfig`, the
 *           interval and the experiment are the pricing table's.
 * Runtime: isomorphic
 * Governing contract: ADR 0242 (plan ladders), ADR 0128 d2
 */
import { useConfig } from "@stackra/config/react";
import { useTranslation } from "@stackra/i18n/react";
import type { RouteComponent } from "@stackra/navigation";
import { I18n } from "#stackra/i18n";
import { FaqSection } from "#src/blocks/faq-section";
import { PricingTable } from "#src/blocks/pricing-table";
import { SiteConfig } from "#src/config/site.config";
import type { PricingRoute } from "#src/routes/pricing.route";

/** Pricing page component: heading, plan ladder and FAQ from what PricingRoute loaded. */
export const PricingPage: RouteComponent<typeof PricingRoute> = ({ data }) => {
  const { t } = useTranslation();
  const site = useConfig(SiteConfig);
  return (
    <>
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">{t(I18n.web.pricing.title)}</h1>
        <p className="mt-3 text-lg text-ink-muted">
          {t(I18n.web.pricing.subtitle, { days: data.ladder.trialDays })}
        </p>
      </header>
      <PricingTable data={data.ladder} product={site.product} />
      <FaqSection title={t(I18n.web.faq.title)} data={{ entries: data.faq }} />
    </>
  );
};
