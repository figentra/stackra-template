/**
 * Stackra file contract:
 * Purpose: the points-issued component folder's public face: the web renderer and its Props.
 * Boundary: names each re-export and declares nothing; the `./react` entry re-exports this folder.
 * Runtime: browser
 * Governing contract: ADR 0294 (decision 15, as amended by programming model v3.1, AGENTS.md:
 *                     Props beside the component, re-exported with it)
 */
export { PointsIssued } from "#react/points-issued/points-issued";
export type { PointsIssuedProps } from "#react/points-issued/points-issued.props";
