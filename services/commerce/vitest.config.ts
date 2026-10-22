/**
 * Stackra file contract:
 * Purpose: vitest settings of the commerce service: the node preset, nothing local.
 * Boundary: the preset turns on legacy decorators and splits the tests into a `unit` project and an
 *           `int` project (`.int.test.ts`); nothing local.
 * Runtime: node
 * Governing contract: ADR 0022 (tests beside the subject), ADR 0182 (tiers)
 */
import { nodePreset } from "@stackra/vitest-config";

/** The node preset; `.int.test.ts` files run in the `int` project, everything else in `unit`. */
export default nodePreset({ root: import.meta.dirname });
