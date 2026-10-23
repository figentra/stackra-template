/**
 * Stackra file contract:
 * Purpose: the page-builder block `web.faq_section`: an accordion of questions fed by the `faq`
 *          content type.
 * Boundary: the class is the props shape a document may pass (only the heading is the document's);
 *           `accepts` names the query whose output the renderer takes as `data`, batched by the
 *           document renderer. Its renderer is `faq-section.tsx`, bound by name; the key is derived
 *           from the folder. Published documents name it `web.faq`, so `@Renamed` keeps that key
 *           resolving.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 14, 16 and 20, as amended by programming model v3.1,
 *                     AGENTS.md: icon names and client classes), ADR 0110 (registered coded
 *                     blocks), ADR 0116 CT4
 */
import { Block, BlockCategory, type LocalizedText } from "@stackra/experience";
import { Renamed } from "@stackra/validation";
import { ListEntriesQuery } from "#stackra/clients/content";

/** The section heading; the questions are the `faq` entries of the site. */
@Renamed("web.faq")
export class FaqSectionBlock extends Block({
  category: BlockCategory.Content,
  icon: "circle-question-mark",
  accepts: ListEntriesQuery,
}) {
  /** The section heading. */
  title!: LocalizedText;
}
