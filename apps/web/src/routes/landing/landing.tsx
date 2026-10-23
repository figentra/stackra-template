/**
 * Stackra file contract:
 * Purpose: the landing page, bound to `LandingRoute` by name: hero, features, the plan ladder,
 *          testimonials, FAQ and a closing call to action, from what the route loaded.
 * Boundary: composition only; every section is the renderer of a Block class, given plain
 *           translated strings. Calls to action name route keys; the product sold comes from the
 *           site config through `useConfig`. The route is imported as a type only.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 7 and 14, as amended by programming model v3.1,
 *                     AGENTS.md: class components and icon names), ADR 0114 (every page can become
 *                     a document)
 */
import { useConfig } from "@stackra/config/react";
import { useTranslation } from "@stackra/i18n/react";
import type { RouteProps } from "@stackra/navigation";
import { Component } from "@stackra/ui";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";
import { CtaBanner } from "#src/blocks/cta-banner/cta-banner";
import { FaqSection } from "#src/blocks/faq-section/faq-section";
import { FeatureGrid } from "#src/blocks/feature-grid/feature-grid";
import { HeroSection } from "#src/blocks/hero-section/hero-section";
import { PricingTable } from "#src/blocks/pricing-table/pricing-table";
import { Testimonials } from "#src/blocks/testimonials/testimonials";
import { SiteConfig } from "#src/config/site.config";
import type { LandingRoute } from "#src/routes/landing/landing.route";
import type { FeatureCard } from "#src/types/feature-card.type";

/** Hero, features, plans, testimonials, FAQ and call to action from the route's data. */
export class Landing extends Component<RouteProps<typeof LandingRoute>> {
  /** The translator of the visitor's locale. */
  translation = useTranslation();

  /** The site config; its `product` names the ladder the page sells. */
  site = useConfig(SiteConfig);

  /** The three feature cards, translated. */
  get features(): FeatureCard[] {
    const { t } = this.translation;
    const cards = [
      { icon: "tags", copy: I18n.web.features.catalogue },
      { icon: "clipboard-list", copy: I18n.web.features.orders },
      { icon: "gift", copy: I18n.web.features.loyalty },
    ] as const;
    return cards.map(({ icon, copy }) => ({ icon, title: t(copy.title), body: t(copy.body) }));
  }

  /** Each section from the loader's data, in page order. */
  render() {
    const { t } = this.translation;
    const { data } = this.props;
    return (
      <>
        <HeroSection
          title={t(I18n.web.hero.title)}
          subtitle={t(I18n.web.hero.subtitle)}
          cta={{ label: t(I18n.web.hero.cta), route: Routes.pricing.name }}
          secondary={{ label: t(I18n.web.hero.secondary), route: Routes.store.name }}
        />
        <FeatureGrid title={t(I18n.web.features.title)} features={this.features} />
        <PricingTable data={data.ladder} product={this.site.product} />
        <Testimonials
          title={t(I18n.web.testimonials.title)}
          data={{ entries: data.testimonials }}
          limit={3}
        />
        <FaqSection title={t(I18n.web.faq.title)} data={{ entries: data.faq }} />
        <CtaBanner
          title={t(I18n.web.cta.title)}
          body={t(I18n.web.cta.body)}
          button={{ label: t(I18n.web.cta.button), route: Routes.pricing.name }}
        />
      </>
    );
  }
}
