/**
 * Stackra file contract:
 * Purpose: the renderer of `FeatureGridBlock`, bound by name: three to six feature cards under a
 *          heading.
 * Boundary: presentation only; text arrives resolved to the visitor's locale. Icons are `Icons`
 *           cases resolved by @stackra/ui/icons, never SVG passed in (a block may not carry markup,
 *           ADR 0112).
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 7 and 14), ADR 0110
 */
import { Card } from "@stackra/ui";
import { Icon, type Icons } from "@stackra/ui/icons";

/** One feature card's content, its text resolved. */
export interface FeatureCard {
  /** An `Icons` case; decorative, hidden from assistive tech. */
  readonly icon: Icons;
  /** The card heading, already translated. */
  readonly title: string;
  /** One or two sentences. */
  readonly body: string;
}

/** Heading and cards. */
export interface FeatureGridProps {
  /** The section heading, already in the visitor's language. */
  readonly title: string;
  /** Rendered in order; the grid is one column on phones, three on desktop. */
  readonly features: readonly FeatureCard[];
}

/** A labelled section so screen readers can jump to it; icons are decorative. */
export function FeatureGrid({ title, features }: FeatureGridProps) {
  return (
    <section aria-labelledby="features-title" className="py-12">
      <h2 id="features-title" className="text-center text-3xl font-semibold tracking-tight">
        {title}
      </h2>
      <ul className="mt-8 grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <li key={feature.title}>
            <Card className="h-full">
              <Card.Header>
                <Icon name={feature.icon} aria-hidden className="size-6 text-accent" />
                <Card.Title>{feature.title}</Card.Title>
              </Card.Header>
              <Card.Content>
                <Card.Description>{feature.body}</Card.Description>
              </Card.Content>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
