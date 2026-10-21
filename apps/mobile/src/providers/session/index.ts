/**
 * Stackra file contract:
 * Purpose: the provider folder's barrel: the context component and its hook.
 * Boundary: explicit export only.
 * Runtime: react-native
 * Governing contract: ADR 0128
 */
export { SessionContextProvider } from "./session.context";
export type { SessionContextProviderProps } from "./session.context";
export { useRequireSession } from "./use-require-session";
