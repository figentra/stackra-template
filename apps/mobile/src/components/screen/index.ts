/**
 * Stackra file contract:
 * Purpose: the component folder's barrel.
 * Boundary: the component and its Props only.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 14, as amended by programming model v3.1, AGENTS.md: Props
 *                     in their own file)
 */
export { Screen } from "./screen";
export type { ScreenProps } from "./screen.props";
