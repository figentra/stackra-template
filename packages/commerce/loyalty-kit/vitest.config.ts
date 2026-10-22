/**
 * Stackra file contract:
 * Purpose: vitest settings of the loyalty kit: the library preset with a jsdom project for ./react.
 * Boundary: the preset adds the shared coverage gate, maps `.int.test.ts` to the `int` project and
 *           runs `.test.tsx` under src/react in jsdom. Nothing local.
 * Runtime: node
 * Governing contract: ADR 0022, 0182 (tiers)
 */
import { libraryPreset } from "@stackra/vitest-config";

/** Unit files run in `unit`, `.int.test.ts` in `int`, `.test.tsx` under src/react in jsdom. */
export default libraryPreset({ root: import.meta.dirname, react: "src/react" });
