/**
 * Stackra file contract:
 * Purpose: the page-builder block `web.hero_section`: the headline section a tenant places at the
 *          top of a document.
 * Boundary: the class is the props shape a document may pass, validated on publish and on render;
 *           its renderer is `hero-section.tsx`, bound by name; the key is derived from the folder.
 *           Text is `LocalizedText` (one value per locale), actions are route keys. Published
 *           documents name it `web.hero`, so `@Renamed` keeps that key resolving.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 14, 16 and 20, as amended by programming model v3.1,
 *                     AGENTS.md: icon names and client classes), ADR 0110 (registered coded blocks)
 */
import { Block, BlockCategory, type LocalizedText } from "@stackra/experience";
import { Renamed } from "@stackra/validation";
import type { CallToAction } from "#src/schemas/call-to-action.schema";

/** Headline, one sentence under it, a primary and an optional secondary action. */
@Renamed("web.hero")
export class HeroSectionBlock extends Block({
  category: BlockCategory.Marketing,
  icon: "sparkles",
}) {
  /** The page's one heading. */
  title!: LocalizedText;

  /** One sentence under the title. */
  subtitle!: LocalizedText;

  /** The filled button. */
  cta!: CallToAction;

  /** An outline button beside it. */
  secondary?: CallToAction;
}
