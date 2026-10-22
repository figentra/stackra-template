/**
 * Stackra file contract:
 * Purpose: the `promo-banner` L2 block this app contributes: a block tenants place in documents,
 *          with a headline, body text and one call to action that is a closed UI verb or an action
 *          key.
 * Boundary: a declaration (blocks are `@Block` classes in `blocks/`). `key` is the one string, at
 *           the declaration site; no version until `@Version` says otherwise (ADR 0131); `props` is
 *           the schema class the service validates on publish and the renderer re-validates on
 *           render; `component` is the function beside it.
 * Runtime: isomorphic
 * Governing contract: ADR 0110, ADR 0112
 */
import { Target } from "@stackra/contracts";
import { Block } from "@stackra/experience";
import { PromoBanner } from "#src/blocks/promo-banner/promo-banner";
import { PromoBannerProps } from "#src/schemas/promo-banner.schema";

/**
 * Registered as `mobile.promo_banner`; documents reference it by class
 * (`Blocks.custom(PromoBannerBlock, …)`).
 */
@Block({
  key: "promo_banner",
  props: PromoBannerProps,
  component: PromoBanner,
  targets: [Target.Ios, Target.Android],
})
export class PromoBannerBlock {}
