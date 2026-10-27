/**
 * Stackra file contract:
 * Purpose: one feature card inside the `web.feature_grid` block's props: an icon, a title and a
 *          line.
 * Boundary: a shape class nested in the block's props; the icon is an `IconName`, never SVG markup
 *           (a block carries no markup, ADR 0112). `IconName` and `LocalizedText` ship no schema,
 *           so each field states its zod through the `@Field` hatch with its reason.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 8 and 26), ADR 0110 d6, ADR 0112
 */
import type { LocalizedText } from "@stackra/experience";
import type { IconName } from "@stackra/icons/contracts";
import { Field, Schema } from "@stackra/validation";
import { z } from "zod";

/** An icon, a heading and one or two sentences, each text one value per locale. */
export class Feature extends Schema {
  /** A Lucide icon name (`"tags"`); decorative, hidden from assistive tech. */
  // reason: `IconName` ships no schema; gen validates icon names where it ships the icons, so the
  // document check only needs a string
  @Field(z.custom<IconName>((name) => typeof name === "string"))
  icon!: IconName;

  /** The card heading. */
  // reason: `LocalizedText` ships no schema; this is its shape, a read-only map of locale to text
  @Field(z.record(z.string(), z.string()).readonly())
  title!: LocalizedText;

  /** One or two sentences. */
  // reason: `LocalizedText` ships no schema; this is its shape, a read-only map of locale to text
  @Field(z.record(z.string(), z.string()).readonly())
  body!: LocalizedText;
}
