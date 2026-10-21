/**
 * Stackra file contract:
 * Purpose: registers `Testimonials` as the page-builder block `web.testimonials`: customer quotes
 *          fed by the `testimonial` content type.
 * Boundary: a `@Block` class: the component and the props schema are options; the key is declared
 *           short and snake_case and gen prefixes the member key on the wire. `accepts` names the
 *           query whose output the component takes as `data`, batched by the renderer.
 * Runtime: isomorphic
 * Governing contract: ADR 0110 (L2: registered coded components, validated props), ADR 0231
 */
import { Block } from "@stackra/experience";
import { Content } from "#stackra/clients";
import { Testimonials } from "#src/blocks/testimonials/testimonials";
import { TestimonialsProps } from "#src/schemas/testimonials-props.schema";

/** Page-builder block `web.testimonials`: customer quotes fed by the `testimonial` content type. */
@Block({
  key: "testimonials",
  component: Testimonials,
  props: TestimonialsProps,
  accepts: Content.queries.ListEntries,
})
export class TestimonialsBlock {}
