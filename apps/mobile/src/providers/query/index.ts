/**
 * Stackra file contract:
 * Purpose: the provider folder's barrel.
 * Boundary: explicit export only; the hooks are the packages' (`useQuery`, `useAction`,
 *           `useMutationQueue`).
 * Runtime: react-native
 * Governing contract: ADR 0128
 */
export { TenantQueryContextProvider } from "./tenant-query.context";
export type { TenantQueryContextProviderProps } from "./tenant-query.context";
