/**
 * Stackra file contract:
 * Purpose: the pricing experiment: show the yearly price first on the pricing page to some
 *          visitors, and compare trial starts against the monthly-first control.
 * Boundary: a release switch evaluated per visitor after consent; it never changes a price, only
 *           which interval the toggle opens on. It expires with the experiment and gen warns after
 *           that date.
 * Runtime: isomorphic
 * Governing contract: ADR 0213 d3 (flags are a settings kind)
 */
import { Flag } from "@stackra/feature-flags";

/** Off by default, so a visitor without consent always sees the monthly-first control. */
@Flag({ key: "pricing_yearly_first", default: false, owner: "web", expires: "2027-03-31" })
export class PricingYearlyFirstFlag {}
