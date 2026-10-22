/**
 * Stackra file contract:
 * Purpose: registers `FeatureGrid` as the page-builder block `web.feature_grid`: a grid of icon,
 *          title and text features for tenant pages.
 * Boundary: a `@Block` class: the component and the props schema are options; the key is declared
 *           short and snake_case and gen prefixes the member key on the wire.
 * Runtime: isomorphic
 * Governing contract: ADR 0110 (L2: registered coded components, validated props), ADR 0231
 */
import { Block } from "@stackra/experience";
import { FeatureGrid } from "#src/blocks/feature-grid/feature-grid";
import { FeatureGridProps } from "#src/schemas/feature-grid-props.schema";

/**
 * Page-builder block `web.feature_grid`: a grid of icon, title and text features for tenant pages.
 */
@Block({ key: "feature_grid", component: FeatureGrid, props: FeatureGridProps })
export class FeatureGridBlock {}
