/**
 * Stackra file contract:
 * Purpose: the dated API versions this service serves and the default for callers with no pin.
 * Boundary: a config class gen reads: a `@Change({ since })` naming a date that is not listed here
 *           is a gen error. Dates, not integers: keys never carry `@n`.
 * Runtime: node
 * Governing contract: ADR 0118 (dated versions, 12-month support, pinning),
 *                     guides/programming-model.mdx#versioning
 */
import { Config } from "@stackra/config";
import { DateList, DateStr } from "@stackra/validation";

/** Oldest first. A date leaves the list twelve months after the next one lands. */
@Config("commerce.versioning")
export class VersioningConfig {
  /**
   * Every date a caller may pin; each one past the first has a `versions/*.change.ts` behind it.
   * Apps generate against the newest (ADR 0118).
   * @defaultValue ["2026-10-01", "2027-03-01"]
   */
  @DateList() supported = ["2026-10-01", "2027-03-01"];
  /**
   * What a key with no pin gets: the oldest supported date, so an unpinned caller never breaks.
   * @defaultValue "2026-10-01"
   */
  @DateStr() fallback = "2026-10-01";
}
