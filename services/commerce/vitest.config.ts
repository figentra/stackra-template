/**
 * Stackra file contract:
 * Purpose: vitest settings of the commerce service: the node preset, nothing local.
 * Boundary: the preset registers the @stackra/testing matchers, keeps `vi.mock` hoisting through
 *           the re-export, runs `stackra gen --if-stale` in global setup and maps `.int.test.ts` to
 *           the integration project (Postgres container).
 * Runtime: node
 * Governing contract: ADR 0022 (tests beside the subject), ADR 0182 (tiers)
 */
import { nodePreset } from "@stackra/vitest-config";

/**
 * The node preset; `.int.test.ts` files get the Testcontainers project, everything else runs on
 * memory drivers.
 */
export default nodePreset({ root: import.meta.dirname });
