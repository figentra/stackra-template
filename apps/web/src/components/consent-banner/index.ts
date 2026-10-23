/**
 * Stackra file contract:
 * Purpose: the component folder's barrel.
 * Boundary: the component only (it takes no Props); its hook stays private to the folder.
 * Runtime: browser
 * Governing contract: ADR 0294 (decision 14: component folders, as amended by programming model
 *                     v3.1, AGENTS.md: the barrel re-exports the component and its Props)
 */
export { ConsentBanner } from "./consent-banner";
