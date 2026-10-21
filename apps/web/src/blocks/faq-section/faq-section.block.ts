/**
 * Stackra file contract:
 * Purpose: registers `FaqSection` as the page-builder block `web.faq`: an accordion of questions
 *          fed by the `faq` content type.
 * Boundary: a `@Block` class: the component and the props schema are options; the key is declared
 *           short and snake_case and gen prefixes the member key on the wire. `accepts` names the
 *           query whose output the component takes as `data`, batched by the renderer.
 * Runtime: isomorphic
 * Governing contract: ADR 0110 (L2: registered coded components, validated props), ADR 0231
 */
import { Block } from "@stackra/experience";
import { Content } from "#stackra/clients";
import { FaqSection } from "#src/blocks/faq-section/faq-section";
import { FaqProps } from "#src/schemas/faq-props.schema";

/** Page-builder block `web.faq`: an accordion of questions fed by the `faq` content type. */
@Block({ key: "faq", component: FaqSection, props: FaqProps, accepts: Content.queries.ListEntries })
export class FaqSectionBlock {}
