/**
 * Stackra file contract:
 * Purpose: the provider folder's barrel.
 * Boundary: explicit export only; flags are read with `useFlag(Flags.x.y)` from
 *           @stackra/feature-flags/react.
 * Runtime: react-native
 * Governing contract: ADR 0128
 */
export { FlagsContextProvider } from "./flags.context";
export type { FlagsContextProviderProps } from "./flags.context";
