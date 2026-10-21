/**
 * Stackra file contract:
 * Purpose: registers `PricingTable` as the page-builder block `web.pricing_table`: the plan ladder
 *          a tenant places in a document.
 * Boundary: a `@Block` class: the component and the props schema are options; the key is declared
 *           short and snake_case and gen prefixes the member key on the wire. `accepts` names the
 *           query whose output the component takes as `data`, batched by the renderer.
 * Runtime: isomorphic
 * Governing contract: ADR 0110 (L2: registered coded components, validated props), ADR 0231
 */
import { Block } from "@stackra/experience";
import { Billing } from "#stackra/clients";
import { PricingTable } from "#src/blocks/pricing-table/pricing-table";
import { PricingTableProps } from "#src/schemas/pricing-table-props.schema";

/** Page-builder block `web.pricing_table`: the plan ladder a tenant places in a document. */
@Block({
  key: "pricing_table",
  component: PricingTable,
  props: PricingTableProps,
  accepts: Billing.queries.ListPlans,
})
export class PricingTableBlock {}
