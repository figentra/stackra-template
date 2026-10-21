/**
 * Stackra file contract:
 * Purpose: the provider folder's barrel: the `@Provider` class and its context component.
 * Boundary: explicit export only; pages subscribe with `useSubscription` from
 *           @stackra/realtime/react.
 * Runtime: react-native
 * Governing contract: ADR 0128
 */
export { RealtimeProvider } from "./realtime.provider";
export { RealtimeContextProvider } from "./realtime.context";
export type { RealtimeContextProviderProps } from "./realtime.context";
