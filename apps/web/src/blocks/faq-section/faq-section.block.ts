/**
 * Stackra file contract:
 * Purpose: the page-builder block `web.faq_section`: an accordion of questions fed by the `faq`
 *          content type.
 * Boundary: the class is the props shape a document may pass (only the heading is the document's);
 *           `accepts` names the query whose output the renderer takes as `data`, batched by the
 *           document renderer. Its renderer is `faq-section.tsx`, bound by name; the key is derived
 *           from the folder.
 *           Published documents name it `web.faq`, so `@Renamed` keeps that key resolving.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 14, 16 and 20), ADR 0110 (registered coded blocks),
 *                     ADR 0116 CT4
 */
import { Block, BlockCategory, type LocalizedText } from "@stackra/experience";
import { Icons } from "@stackra/ui/icons";
import { Renamed } from "@stackra/validation";
import { Content } from "#stackra/clients";

/** The section heading; the questions are the `faq` entries of the site. */
@Renamed("web.faq")
export class FaqSectionBlock extends Block({
  category: BlockCategory.Content,
  icon: Icons.Question,
  accepts: Content.queries.ListEntries,
}) {
  /** The section heading. */
  title!: LocalizedText;
}
