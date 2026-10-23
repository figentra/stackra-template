/**
 * Stackra file contract:
 * Purpose: the page opener: a headline, a line under it, a primary and an optional secondary call
 *          to action.
 * Boundary: the renderer of `HeroSectionBlock`, bound by name. Props are plain strings so the same
 *           component serves the coded landing page (keys already translated) and the block (the
 *           document renderer picks the locale's value first). Actions name route keys, never
 *           paths.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 7 and 14, as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0110 (a block is a coded component with
 *                     typed props), WCAG 2.2 AA (one h1)
 */
import { Link } from "@stackra/navigation/react";
import { Button, Component } from "@stackra/ui";
import { Routes } from "#stackra/routes";
import type { HeroSectionProps } from "./hero-section.props";

/** Centred, with the actions in a row that wraps on phones; motion respects reduced motion. */
export class HeroSection extends Component<HeroSectionProps> {
  /** The h1, the line and the actions. */
  render() {
    const { title, subtitle, cta, secondary } = this.props;
    return (
      <section className="py-16 text-center md:py-24">
        <h1
          className={`mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-balance
            md:text-6xl`}
        >
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-muted text-pretty">{subtitle}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" render={<Link to={Routes[cta.route]} />}>
            {cta.label}
          </Button>
          {secondary && (
            <Button size="lg" variant="outline" render={<Link to={Routes[secondary.route]} />}>
              {secondary.label}
            </Button>
          )}
        </div>
      </section>
    );
  }
}
