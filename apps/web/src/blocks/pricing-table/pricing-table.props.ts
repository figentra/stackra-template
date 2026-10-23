/**
 * Stackra file contract:
 * Purpose: the Props of `PricingTable`: the output of the plan ladder query and the product it
 *          belongs to.
 * Boundary: a type only; the output type is the billing client's, never redeclared.
 * Runtime: browser
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: Props in
 *                     `<name>.props.ts`), ADR 0110 (a block's `accepts`)
 */
import type { QueryOutput } from "@stackra/clients";
import type { ListPlansQuery } from "#stackra/clients/billing";

/** Block props plus the bound query's output. */
export interface PricingTableProps {
  /** Output of `billing.catalog.plan.list`, fetched by the route or the renderer. */
  readonly data: QueryOutput<typeof ListPlansQuery>;
  /**
   * The product key the ladder belongs to; part of the trial link so billing knows which product to
   * start.
   */
  readonly product: string;
}
