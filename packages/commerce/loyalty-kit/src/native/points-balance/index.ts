/**
 * Stackra file contract:
 * Purpose: the native points-balance component folder's public face: the renderer and its Props.
 * Boundary: names each re-export and declares nothing; the `./native` entry re-exports this folder.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 15, as amended by programming model v3.1, AGENTS.md:
 *                     Props beside the component, re-exported with it)
 */
export { PointsBalance } from "#native/points-balance/points-balance";
export type { PointsBalanceProps } from "#native/points-balance/points-balance.props";
