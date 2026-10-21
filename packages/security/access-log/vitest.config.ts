/**
 * Stackra file contract:
 * Purpose: vitest settings: the library preset.
 * Boundary: the preset registers the matchers of every `./testing` entry this member depends on;
 *           nothing local.
 * Runtime: node
 * Governing contract: ADR 0022
 */
import { libraryPreset } from "@stackra/vitest-config";

export default libraryPreset({ root: import.meta.dirname });
