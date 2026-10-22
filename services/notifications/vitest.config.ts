/**
 * Stackra file contract:
 * Purpose: vitest settings of the notifications service: the service preset.
 * Boundary: the preset turns on legacy decorators and maps `.int.test.ts` to the `int` project;
 *           nothing local.
 * Runtime: node
 * Governing contract: ADR 0022 (tests beside the subject), ADR 0182 (tiers)
 */
import { servicePreset } from "@stackra/vitest-config";

/** The service preset; `.int.test.ts` files run in the `int` project, everything else in `unit`. */
export default servicePreset({ root: import.meta.dirname });
