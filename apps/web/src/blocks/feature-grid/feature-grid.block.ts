/**
 * Stackra file contract:
 * Purpose: the page-builder block `web.feature_grid`: a grid of icon, title and text features for
 *          tenant pages.
 * Boundary: the class is the props shape a document may pass, validated on publish and on render;
 *           its renderer is `feature-grid.tsx`, bound by name; the key is derived from the folder.
 *           An icon is a Lucide `IconName`, never SVG markup.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 14, 16 and 20, as amended by programming model v3.1,
 *                     AGENTS.md: icon names and client classes), ADR 0110 (registered coded
 *                     blocks), ADR 0112
 */
import { Block, BlockCategory, type LocalizedText } from "@stackra/experience";
import { List } from "@stackra/validation";
import type { Feature } from "#src/schemas/feature.schema";

/** The heading and three to six features in display order. */
export class FeatureGridBlock extends Block({
  category: BlockCategory.Marketing,
  icon: "layout-grid",
}) {
  /** The section heading. */
  title!: LocalizedText;

  /** The features in display order; one column on phones, three on desktop. */
  @List({
    min: 3,
    max: 6,
  })
  features!: Feature[];
}
