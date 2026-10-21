/**
 * Stackra file contract:
 * Purpose: registers the welcome hero as a page-builder block: a tenant may place
 *          `console.welcome_hero` in any L2 document; its props are validated against
 *          `WelcomeHeroProps` on publish and on render.
 * Boundary: a `@Block` class whose options name the component and the props schema; a component is
 *           an option, never a body member. The key is a declaration-site string; references use
 *           the class.
 * Runtime: isomorphic
 * Governing contract: ADR 0110 (L2: registered coded components, Zod props)
 */
import { Block } from "@stackra/experience";
import { WelcomeHero } from "#src/blocks/welcome-hero/welcome-hero";
import { WelcomeHeroProps } from "#src/schemas/welcome-hero.schema";

/**
 * Page-builder block `console.welcome_hero`: the welcome hero a tenant may place in any L2
 * document.
 */
@Block({ key: "welcome_hero", component: WelcomeHero, props: WelcomeHeroProps })
export class WelcomeHeroBlock {}
