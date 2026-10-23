/**
 * Stackra file contract:
 * Purpose: the page-builder block `web.testimonials`: customer quotes fed by the `testimonial`
 *          content type.
 * Boundary: the class is the props shape a document may pass (the heading and the cap); `accepts`
 *           names the query whose output the renderer takes as `data`, batched by the document
 *           renderer. Its renderer is `testimonials.tsx`, bound by name; the key is derived from
 *           the folder.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 14, 16 and 20), ADR 0110 (registered coded blocks),
 *                     ADR 0116 CT4
 */
import { Block, BlockCategory, type LocalizedText } from "@stackra/experience";
import { Icons } from "@stackra/ui/icons";
import { Int } from "@stackra/validation";
import { Content } from "#stackra/clients";

/** The heading and a cap of one to twelve quotes. */
export class TestimonialsBlock extends Block({
  category: BlockCategory.Content,
  icon: Icons.Quote,
  accepts: Content.queries.ListEntries,
}) {
  /** The section heading. */
  title!: LocalizedText;

  /** How many quotes to show; the query already limited, this is the block's own cap. */
  @Int({
    min: 1,
    max: 12,
  })
  limit = 3;
}
