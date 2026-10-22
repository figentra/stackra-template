/**
 * Stackra file contract:
 * Purpose: registers `CtaBanner` as the page-builder block `web.cta_banner`: a closing
 *          call-to-action banner for tenant pages.
 * Boundary: a `@Block` class: the component and the props schema are options; the key is declared
 *           short and snake_case and gen prefixes the member key on the wire.
 * Runtime: isomorphic
 * Governing contract: ADR 0110 (L2: registered coded components, validated props), ADR 0231
 */
import { Block } from "@stackra/experience";
import { CtaBanner } from "#src/blocks/cta-banner/cta-banner";
import { CtaProps } from "#src/schemas/cta-props.schema";

/** Page-builder block `web.cta_banner`: a closing call-to-action banner for tenant pages. */
@Block({ key: "cta_banner", component: CtaBanner, props: CtaProps })
export class CtaBannerBlock {}
