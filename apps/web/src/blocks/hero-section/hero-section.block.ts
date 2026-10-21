/**
 * Stackra file contract:
 * Purpose: registers `HeroSection` as the page-builder block `web.hero`: the headline section a
 *          tenant places at the top of a document.
 * Boundary: a `@Block` class: the component and the props schema are options; the key is declared
 *           short and snake_case and gen prefixes the member key on the wire.
 * Runtime: isomorphic
 * Governing contract: ADR 0110 (L2: registered coded components, validated props), ADR 0231
 */
import { Block } from "@stackra/experience";
import { HeroSection } from "#src/blocks/hero-section/hero-section";
import { HeroProps } from "#src/schemas/hero-props.schema";

/** Page-builder block `web.hero`: the headline section a tenant places at the top of a document. */
@Block({ key: "hero", component: HeroSection, props: HeroProps })
export class HeroSectionBlock {}
