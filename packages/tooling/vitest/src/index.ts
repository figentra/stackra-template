/**
 * Stackra file contract:
 * Purpose: the package's `.` entry: the base preset and the four member factories in one import.
 * Boundary: re-exports only. Kept apart from preset.ts so factories.ts can import the presets without a
 *           module cycle.
 * Runtime: node
 * Governing contract: ADR 0007 (documentation).
 * Owner: release-operations · Secrets: forbidden
 */
export { stackraVitest } from "./preset.ts";
export * from "./factories.ts";
