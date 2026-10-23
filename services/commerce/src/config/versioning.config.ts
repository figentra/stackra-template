/**
 * Stackra file contract:
 * Purpose: the dated API versions this service serves and the default for callers with no pin.
 * Boundary: a config class gen also reads: a `Change(Subject, { date })` whose date is not listed
 *           here is a gen error. Dates, not integers: keys never carry a version. The key is
 *           `commerce.versioning` (member key plus file stem).
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 19 and 20), ADR 0118 (dated versions, 12-month support,
 *                     pinning)
 */
import { Config } from "@stackra/config";
import { List, Str } from "@stackra/validation";

/** Oldest first; a date leaves the list twelve months after the next one lands. */
export class VersioningConfig extends Config {
  /** Every date a caller may pin; each one past the first has a `.change.ts` behind it. */
  @List({
    min: 1,
    unique: true,
  })
  @Str({
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    each: true,
  })
  supported = ["2026-10-01", "2027-03-01"];

  /** What a caller with no pin gets: the oldest supported date, so it never breaks. */
  @Str({ pattern: /^\d{4}-\d{2}-\d{2}$/ })
  fallback = "2026-10-01";
}
