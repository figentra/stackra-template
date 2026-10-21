/**
 * Stackra file contract:
 * Purpose: the block folder's barrel: the declaration, the pricing table and its one hook.
 * Boundary: explicit exports only.
 * Runtime: browser
 * Governing contract: ADR 0128
 */
export { PricingTableBlock } from "./pricing-table.block";
export { PricingTable } from "./pricing-table";
export type { PricingTableProps } from "./pricing-table";
export { useBillingInterval } from "./use-billing-interval";
export type { BillingIntervalState } from "./use-billing-interval";
