/**
 * Stackra file contract:
 * Purpose: `VersioningOptions`: the shape of VersioningConfig: the dated API versions this service
 *          serves and the default for callers with no pin.
 * Boundary: a shape class in the member's schemas/ folder, one declaration per file; gen compiles
 *           it to `VersioningConfig$` and reads `supported` at gen time: a
 *           `Change<Subject>({ from })` whose date is not listed is a gen error. Dates, not
 *           integers: keys never carry a version.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 19, 20 and 26, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0118 (dated versions, 12-month support, pinning)
 */
import { List, Schema, Str } from "@stackra/validation";

/** Oldest first; a date leaves the list twelve months after the next one lands. */
export class VersioningOptions extends Schema {
  /** Every date a caller may pin; each one past the first has a `.change.ts` behind it. */
  @List({
    min: 1,
    unique: true,
  })
  @Str({
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    each: true,
  })
  supported: string[] = ["2026-10-01", "2027-03-01"];

  /** What a caller with no pin gets: the oldest supported date, so it never breaks. */
  @Str({ pattern: /^\d{4}-\d{2}-\d{2}$/ })
  fallback = "2026-10-01";
}
