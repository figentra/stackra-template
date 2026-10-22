/**
 * Stackra file contract:
 * Purpose: the props of the `web.feature_grid` block: three to six features, each an icon, a title
 *          and a line.
 * Boundary: one schema class; an icon is an `Icons` case, never SVG markup (a block carries no
 *           markup, ADR 0112).
 * Runtime: isomorphic
 * Governing contract: ADR 0110 d6, ADR 0112, ADR 0095
 */
import { LocalizedText } from "@stackra/experience";
import { Schema, z } from "@stackra/schema";
import { Icons } from "@stackra/ui/icons";

/** The heading and the features in display order. */
export class FeatureGridProps extends Schema(
  z.object({
    title: LocalizedText.schema,
    features: z
      .array(
        z.object({
          icon: Icons.schema,
          title: LocalizedText.schema,
          body: LocalizedText.schema,
        }),
      )
      .min(3)
      .max(6),
  }),
) {}
