/**
 * Stackra file contract:
 * Purpose: the release switch `web.help_centre`: whether the header links the tenant's help centre,
 *          a page-builder page at `/help`, while tenants are still writing theirs.
 * Boundary: a release switch evaluated per visitor; off, `SiteMenu` leaves the item out and the
 *           page stays reachable only by its URL. It never hides content that must stay public. The
 *           key is derived from the class name; its label is the derived i18n key
 *           `web::flags.help_centre.label`. A release switch has no end date; its owner is the
 *           member's CODEOWNERS entry, never a field here.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 14 and 20), ADR 0213 d3 (flags are a settings kind)
 */
import { Flag } from "@stackra/feature-flags";

/** Off by default: the header links the help centre only where the flag is turned on. */
export class HelpCentreFlag extends Flag({
  default: false,
}) {}
