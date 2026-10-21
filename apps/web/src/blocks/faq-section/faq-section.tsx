/**
 * Stackra file contract:
 * Purpose: the FAQ accordion from the `faq` content type; the matching FAQPage JSON-LD is the
 *          route's `meta`.
 * Boundary: presentation over `content.entry.list`. Answers are plain text; a rich answer would be
 *           an L2 document rendered by DocumentRenderer, never HTML.
 * Runtime: browser
 * Governing contract: ADR 0116 CT4, ADR 0128, WCAG 2.2 AA (HeroUI Accordion: buttons with names,
 *                     arrow keys)
 */
import { Accordion } from "@stackra/ui";
import type { QueryOutput } from "@stackra/clients";
import type { Content } from "#stackra/clients";

/** Block props plus the bound query's output. */
export interface FaqSectionProps {
  /** The section heading, already in the visitor's language. */
  readonly title: string;
  /** Output of `content.entry.list` for the FAQ entry type. */
  readonly data: QueryOutput<typeof Content.queries.ListEntries>;
}

/** One expanded at a time; the first stays closed so the page's length is predictable for LCP. */
export function FaqSection({ title, data }: FaqSectionProps) {
  if (data.entries.length === 0) return null;
  return (
    <section aria-labelledby="faq-title" className="mx-auto max-w-3xl py-12">
      <h2 id="faq-title" className="text-center text-3xl font-semibold tracking-tight">
        {title}
      </h2>
      <Accordion variant="surface" className="mt-8">
        {data.entries.map((entry) => (
          <Accordion.Item key={entry.id} id={entry.id}>
            <Accordion.Heading>
              <Accordion.Trigger>
                {entry.fields.question}
                <Accordion.Indicator />
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
              <Accordion.Body>{entry.fields.answer}</Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </section>
  );
}
