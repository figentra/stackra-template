/**
 * Stackra file contract:
 * Purpose: the renderer of `FaqSectionBlock`, bound by name: the FAQ accordion from the `faq`
 *          content type; the matching FAQPage JSON-LD is the route's `meta`.
 * Boundary: presentation over `content.entry.list`, the block's `accepts`. Answers are plain text;
 *           a rich answer would be an L2 document rendered by DocumentRenderer, never HTML.
 * Runtime: browser
 * Governing contract: ADR 0294 (decision 14, as amended by programming model v3.1, AGENTS.md: class
 *                     components), ADR 0116 CT4, WCAG 2.2 AA (HeroUI Accordion: buttons with names,
 *                     arrow keys)
 */
import { Accordion, Component } from "@stackra/ui";
import type { FaqSectionProps } from "./faq-section.props";

/** One expanded at a time; the first stays closed so the page's length is predictable for LCP. */
export class FaqSection extends Component<FaqSectionProps> {
  /** Nothing without entries; otherwise a labelled section with the accordion. */
  render() {
    const { title, data } = this.props;
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
}
