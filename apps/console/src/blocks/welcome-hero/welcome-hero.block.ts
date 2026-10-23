/**
 * Stackra file contract:
 * Purpose: the page-builder block `console.welcome_hero`: a tenant may place it in any document;
 *          its props are validated on publish and on render.
 * Boundary: the class is the props shape (its fields), and its renderer is `welcome-hero.tsx` in
 *           this folder, bound by name; the key is derived from the folder. Text arrives as i18n
 *           keys, never markup; the call to action names a route key, never a URL. The icon is an
 *           `IconName`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 14, 16 and 20; as amended by programming model v3.1,
 *                     AGENTS.md: icon names), ADR 0110 (registered coded blocks)
 */
import type { I18nKey } from "@stackra/i18n";
import { Block, BlockCategory } from "@stackra/experience";
import type { WelcomeHeroAction } from "#src/schemas/welcome-hero-action.schema";

/** Heading key, body key and one optional call to action. */
export class WelcomeHeroBlock extends Block({
  category: BlockCategory.Content,
  icon: "house",
}) {
  /** The heading, as an i18n key the document references. */
  titleKey!: I18nKey;

  /** The line under the heading, as an i18n key. */
  bodyKey!: I18nKey;

  /** The one call to action; absent renders no button. */
  action?: WelcomeHeroAction;
}
