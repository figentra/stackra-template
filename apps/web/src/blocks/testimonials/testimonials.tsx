/**
 * Stackra file contract:
 * Purpose: the renderer of `TestimonialsBlock`, bound by name: quotes from the `testimonial`
 *          content type (quote, author, role).
 * Boundary: presentation over `content.entry.list`, the block's `accepts`; fields are plain strings
 *           the content type validated.
 * Runtime: browser
 * Governing contract: ADR 0294 (decision 14, as amended by programming model v3.1, AGENTS.md: class
 *                     components), ADR 0116 CT4 (testimonial is a built-in content type)
 */
import { Card, Component } from "@stackra/ui";
import type { TestimonialsProps } from "./testimonials.props";

/**
 * `<blockquote>` with `<cite>` per entry; nothing is rendered when there are no entries (no empty
 * heading).
 */
export class Testimonials extends Component<TestimonialsProps> {
  /** The entries up to the block's cap. */
  get entries() {
    return this.props.data.entries.slice(0, this.props.limit);
  }

  /** Nothing without entries; otherwise the heading and one quote card per entry. */
  render() {
    if (this.entries.length === 0) return null;
    return (
      <section aria-labelledby="testimonials-title" className="py-12">
        <h2 id="testimonials-title" className="text-center text-3xl font-semibold tracking-tight">
          {this.props.title}
        </h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {this.entries.map((entry) => (
            <li key={entry.id}>
              <Card className="h-full">
                <Card.Content>
                  <blockquote className="text-pretty">
                    <p>“{entry.fields.quote}”</p>
                    <footer className="mt-4 text-sm text-ink-muted">
                      <cite className="not-italic">{entry.fields.author}</cite>
                      {entry.fields.role && <span>, {entry.fields.role}</span>}
                    </footer>
                  </blockquote>
                </Card.Content>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    );
  }
}
