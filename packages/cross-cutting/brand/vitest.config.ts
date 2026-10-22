/**
 * Stackra file contract:
 * Purpose: vitest settings of the brand package: the library preset, nothing local.
 * Boundary: the preset adds the shared coverage gate and the `unit` and `int` projects; the brand
 *           package has unit tests of its pure functions only.
 * Runtime: node
 * Governing contract: ADR 0022 (tests beside the subject), ADR 0182 (tiers)
 */
import { libraryPreset } from "@stackra/vitest-config";

/** The library preset; every brand test is a pure-function unit test. */
export default libraryPreset({ root: import.meta.dirname });
