/**
 * Stackra file contract:
 * Purpose: the provider folder's barrel.
 * Boundary: explicit export only; the scheme hook is `useColorScheme` from @stackra/theming/react.
 * Runtime: react-native
 * Governing contract: ADR 0128
 */
export { ThemeContextProvider } from "./theme.context";
export type { ThemeContextProviderProps } from "./theme.context";
