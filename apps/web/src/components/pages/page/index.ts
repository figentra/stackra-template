/**
 * Stackra file contract:
 * Purpose: the page folder's barrel.
 * Boundary: explicit exports only.
 * Runtime: isomorphic
 * Governing contract: ADR 0128 d2
 */
export { TenantPage } from "./page";
export { TenantPageFallback } from "./tenant-page-fallback";
