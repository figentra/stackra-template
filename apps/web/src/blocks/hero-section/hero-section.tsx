/**
 * Stackra file contract:
 * Purpose: the page opener: a headline, a line under it, a primary and an optional secondary call
 *          to action.
 * Boundary: presentation only. Props are plain strings so the same component serves the coded
 *           landing page (keys already translated) and the `web.hero` block (the renderer picks the
 *           locale's value first). Actions name route keys, never paths.
 * Runtime: browser
 * Governing contract: ADR 0128, ADR 0110 (a block is a coded component with typed props), WCAG 2.2
 *                     AA (one h1)
 */
import { Link } from "@stackra/navigation/react";
import { Button } from "@stackra/ui";
import { Routes, type RouteKey } from "#stackra/routes";

/** A call to action: the label and the route it opens in the visitor's locale. */
export interface HeroAction {
  /** Button text, already translated. */
  readonly label: string;
  /** The route the button opens. */
  readonly route: RouteKey;
}

/** Copy and actions of the hero. */
export interface HeroSectionProps {
  /** The page's h1. */
  readonly title: string;
  /** One sentence under the title. */
  readonly subtitle: string;
  /** The filled button. */
  readonly cta: HeroAction;
  /** An outline button beside it. */
  readonly secondary?: HeroAction;
}

/** Centred, with the actions in a row that wraps on phones; motion respects reduced motion. */
export function HeroSection({ title, subtitle, cta, secondary }: HeroSectionProps) {
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
