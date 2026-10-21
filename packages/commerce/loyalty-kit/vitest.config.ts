/**
 * Stackra file contract:
 * Purpose: vitest settings of the loyalty kit: the library preset with a jsdom project for ./react.
 * Boundary: the preset registers every `./testing` matcher of the packages this member depends on
 *           (errors, events, iam, and this package's own), runs `stackra gen --if-stale` in global
 *           setup, and maps `.int.test.ts` to the Postgres project. Nothing local.
 * Runtime: node
 * Governing contract: ADR 0022, 0182 (tiers)
 */
import { libraryPreset } from "@stackra/vitest-config";

/**
 * Unit files run on memory drivers; `.int.test.ts` gets Testcontainers; `.test.tsx` under src/react
 * gets jsdom.
 */
export default libraryPreset({ root: import.meta.dirname, react: "src/react" });
