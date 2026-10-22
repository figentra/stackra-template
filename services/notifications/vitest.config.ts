/**
 * Stackra file contract:
 * Purpose: vitest settings of the notifications service: the node preset.
 * Boundary: the preset turns on legacy decorators and maps `.int.test.ts` to the `int` project;
 *           nothing local.
 * Runtime: node
 * Governing contract: ADR 0022 (tests beside the subject), ADR 0182 (tiers)
 */
import { nodePreset } from "@stackra/vitest-config";

/** The node preset; `.int.test.ts` files run in the `int` project, everything else in `unit`. */
export default nodePreset({ root: import.meta.dirname });
