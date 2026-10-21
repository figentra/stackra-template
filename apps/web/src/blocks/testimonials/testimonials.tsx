/**
 * Stackra file contract:
 * Purpose: quotes from the `testimonial` content type: quote, author, role.
 * Boundary: presentation over `content.entry.list`; fields are plain strings the content type
 *           validated.
 * Runtime: browser
 * Governing contract: ADR 0116 CT4 (testimonial is a built-in content type), ADR 0128
 */
import { Card } from "@stackra/ui";
import type { QueryOutput } from "@stackra/clients";
import type { Content } from "#stackra/clients";

/** Block props plus the bound query's output. */
export interface TestimonialsProps {
  /** The section heading, already in the visitor's language. */
  readonly title: string;
  /** Output of `content.entry.list` for the testimonial entry type. */
  readonly data: QueryOutput<typeof Content.queries.ListEntries>;
  /** How many to show; the query already limited, this is the block's own cap. */
  readonly limit: number;
}

/**
 * `<blockquote>` with `<cite>` per entry; nothing is rendered when there are no entries (no empty
 * heading).
 */
export function Testimonials({ title, data, limit }: TestimonialsProps) {
  const entries = data.entries.slice(0, limit);
  if (entries.length === 0) return null;
  return (
    <section aria-labelledby="testimonials-title" className="py-12">
      <h2 id="testimonials-title" className="text-center text-3xl font-semibold tracking-tight">
        {title}
      </h2>
      <ul className="mt-8 grid gap-4 md:grid-cols-3">
        {entries.map((entry) => (
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
