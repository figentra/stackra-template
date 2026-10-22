/**
 * Stackra file contract:
 * Purpose: vitest settings of the notifications service: the node preset.
 * Boundary: the preset registers the matchers of every `./testing` entry this member depends on and
 *           maps `.int.test.ts` to the Postgres project; nothing local.
 * Runtime: node
 * Governing contract: ADR 0022 (tests beside the subject), ADR 0182 (tiers)
 */
import { nodePreset } from "@stackra/vitest-config";

/** The node preset; `.int.test.ts` files get the Postgres project, everything else memory. */
export default nodePreset({ root: import.meta.dirname });
