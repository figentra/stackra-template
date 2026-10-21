/**
 * Stackra file contract:
 * Purpose: the component folder's barrel.
 * Boundary: explicit exports only.
 * Runtime: browser
 * Governing contract: ADR 0128
 */
export { CommandPalette } from "./command-palette";
export { useCommandPalette } from "./use-command-palette";
export type { CommandPaletteState } from "./use-command-palette";
