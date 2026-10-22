/**
 * Stackra file contract:
 * Purpose: vitest settings: the library preset.
 * Boundary: the preset adds the shared coverage gate and the `unit` and `int` projects; nothing
 *           local.
 * Runtime: node
 * Governing contract: ADR 0022
 */
import { libraryPreset } from "@stackra/vitest-config";

export default libraryPreset({ root: import.meta.dirname });
