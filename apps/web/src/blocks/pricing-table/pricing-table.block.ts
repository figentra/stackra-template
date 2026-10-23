/**
 * Stackra file contract:
 * Purpose: the page-builder block `web.pricing_table`: the plan ladder a tenant places in a
 *          document.
 * Boundary: the class is the props shape a document may pass (which product's ladder it shows);
 *           `accepts` names the query whose output the renderer takes as `data`, batched by the
 *           document renderer. Its renderer is `pricing-table.tsx`, bound by name; the key is
 *           derived from the folder.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 14, 16 and 20), ADR 0110 (registered coded blocks),
 *                     ADR 0242
 */
import { Block, BlockCategory } from "@stackra/experience";
import { Icons } from "@stackra/ui/icons";
import { Billing } from "#stackra/clients";

/** The product whose ladder the table shows; the plans arrive through `accepts`. */
export class PricingTableBlock extends Block({
  category: BlockCategory.Commerce,
  icon: Icons.Receipt,
  accepts: Billing.queries.ListPlans,
}) {
  /** The product key of `billing.catalog.plan.list`; part of the trial link. */
  product!: string;
}
