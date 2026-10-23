/**
 * Stackra file contract:
 * Purpose: the renderer of `FeatureGridBlock`, bound by name: three to six feature cards under a
 *          heading.
 * Boundary: presentation only; text arrives resolved to the visitor's locale. Icons are `IconName`
 *           strings resolved by `Icon` from @stackra/ui, never SVG passed in (a block may not carry
 *           markup, ADR 0112).
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 7 and 14, as amended by programming model v3.1,
 *                     AGENTS.md: class components and icon names), ADR 0110
 */
import { Card, Component, Icon } from "@stackra/ui";
import type { FeatureGridProps } from "./feature-grid.props";

/** A labelled section so screen readers can jump to it; icons are decorative. */
export class FeatureGrid extends Component<FeatureGridProps> {
  /** The heading and one card per feature, in order. */
  render() {
    const { title, features } = this.props;
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
}
