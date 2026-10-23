/**
 * Stackra file contract:
 * Purpose: the pricing experiment `web.pricing_yearly_first`: show the yearly price first on the
 *          pricing page to some visitors, and compare trial starts against the monthly-first
 *          control.
 * Boundary: a release switch evaluated per visitor after consent; it never changes a price, only
 *           which interval the toggle opens on. The key is derived from the class name; its label
 *           is the derived i18n key `web::flags.pricing_yearly_first.label`. It expires with the
 *           experiment and gen warns after that date. Its owner is the member's CODEOWNERS entry,
 *           never a field here.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 14 and 20), ADR 0213 d3 (flags are a settings kind)
 */
import { Flag } from "@stackra/feature-flags";

/** Off by default, so a visitor without consent always sees the monthly-first control. */
export class PricingYearlyFirstFlag extends Flag({
  default: false,
  expires: "2027-03-31",
}) {}
