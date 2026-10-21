/**
 * Stackra file contract:
 * Purpose: the provider folder's barrel: the `@Provider` class, its context component and its hook.
 * Boundary: explicit export only.
 * Runtime: react-native
 * Governing contract: ADR 0128
 */
export { TenantProvider } from "./tenant.provider";
export type { TenantSelection } from "./tenant.provider";
export { TenantContextProvider } from "./tenant.context";
export type { TenantContextProviderProps } from "./tenant.context";
export { useActiveTenant } from "./use-active-tenant";
export type { ActiveTenantState } from "./use-active-tenant";
