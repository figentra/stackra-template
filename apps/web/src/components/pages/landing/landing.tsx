/**
 * Stackra file contract:
 * Purpose: the landing page: hero, features, the plan ladder, testimonials, FAQ and a closing call
 *          to action, from what LandingRoute loaded.
 * Boundary: composition only; every section is a component that is also a `@Block`. Calls to action
 *           name route keys; the product sold comes from the site config through `useConfig`. The
 *           route is imported as a type only.
 * Runtime: isomorphic
 * Governing contract: ADR 0114 (every page can become a document), ADR 0128 d2
 */
import { useConfig } from "@stackra/config/react";
import { useTranslation } from "@stackra/i18n/react";
import type { RouteComponent } from "@stackra/navigation";
import { Icons } from "@stackra/ui/icons";
import { I18n } from "#stackra/i18n";
import { CtaBanner } from "#src/blocks/cta-banner";
import { FaqSection } from "#src/blocks/faq-section";
import { FeatureGrid } from "#src/blocks/feature-grid";
import { HeroSection } from "#src/blocks/hero-section";
import { PricingTable } from "#src/blocks/pricing-table";
import { Testimonials } from "#src/blocks/testimonials";
import { SiteConfig } from "#src/config/site.config";
import type { LandingRoute } from "#src/routes/landing.route";

/**
 * Landing page component: hero, features, plans, testimonials, FAQ and call to action from
 * LandingRoute data.
 */
export const LandingPage: RouteComponent<typeof LandingRoute> = ({ data }) => {
  const { t } = useTranslation();
  const site = useConfig(SiteConfig);
  const features = [
    { icon: Icons.Catalogue, copy: I18n.web.features.catalogue },
    { icon: Icons.Orders, copy: I18n.web.features.orders },
    { icon: Icons.Loyalty, copy: I18n.web.features.loyalty },
  ].map(({ icon, copy }) => ({ icon, title: t(copy.title), body: t(copy.body) }));
  return (
    <>
      <HeroSection
        title={t(I18n.web.hero.title)}
        subtitle={t(I18n.web.hero.subtitle)}
        cta={{ label: t(I18n.web.hero.cta), route: "pricing" }}
        secondary={{ label: t(I18n.web.hero.secondary), route: "store" }}
      />
      <FeatureGrid title={t(I18n.web.features.title)} features={features} />
      <PricingTable data={data.ladder} product={site.product} />
      <Testimonials
        title={t(I18n.web.testimonials.title)}
        data={{ entries: data.testimonials }}
        limit={3}
      />
      <FaqSection title={t(I18n.web.faq.title)} data={{ entries: data.faq }} />
      <CtaBanner
        title={t(I18n.web.cta.title)}
        body={t(I18n.web.cta.body)}
        button={{ label: t(I18n.web.cta.button), route: "pricing" }}
      />
    </>
  );
};
