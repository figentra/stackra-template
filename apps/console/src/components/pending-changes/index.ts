/**
 * Stackra file contract:
 * Purpose: the component folder's barrel.
 * Boundary: explicit export only.
 * Runtime: browser
 * Governing contract: ADR 0128 (component folders)
 */
export { PendingChanges } from "./pending-changes";
export { usePendingChanges } from "./use-pending-changes";
export type { PendingChangesState } from "./use-pending-changes";
