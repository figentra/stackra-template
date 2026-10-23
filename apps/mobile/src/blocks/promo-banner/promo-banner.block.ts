/**
 * Stackra file contract:
 * Purpose: the promo banner block this app contributes to the page builder: a headline, body text
 *          and one call to action that is a closed verb (navigate to a route of this app, or run an
 *          action by key).
 * Boundary: a block declaration: its fields are the props, which the experience service validates
 *           on publish and the renderer re-validates on render, refusing a key nobody registers
 *           (ADR 0110 decision 6). The key is derived from the folder (`mobile.promo_banner`); the
 *           renderer is `promo-banner.tsx` beside it, bound by name; the targets are the app's.
 *           Strings are tenant-authored, already translated per locale by the service. A breaking
 *           change to the props is a new version.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 14, 16 and 20), ADR 0110, ADR 0112
 */
import { Block, BlockCategory } from "@stackra/experience";
import { Icons } from "@stackra/ui/icons";
import { Str } from "@stackra/validation";
import type { PromoBannerCta } from "#src/schemas/promo-banner-cta.schema";

/** Documents place it by class: `Blocks.custom(PromoBannerBlock, { headline, … })`. */
export class PromoBannerBlock extends Block({
  category: BlockCategory.Marketing,
  icon: Icons.Megaphone,
}) {
  /** At most 60 characters so it fits one line on a phone. */
  @Str({
    min: 1,
    max: 60,
  })
  headline!: string;

  /** Optional supporting text, at most 200 characters. */
  @Str({ max: 200 })
  body?: string;

  /** The button: a label plus a navigate or an action verb; absent renders no button. */
  cta?: PromoBannerCta;
}
