/**
 * Stackra file contract:
 * Purpose: the block folder's barrel: the declaration and the pricing table.
 * Boundary: the block class, the component and its Props only; the folder's hook stays private.
 * Runtime: browser
 * Governing contract: ADR 0128 (component folders)
 */
export { PricingTableBlock } from "./pricing-table.block";
export { PricingTable } from "./pricing-table";
export type { PricingTableProps } from "./pricing-table";
