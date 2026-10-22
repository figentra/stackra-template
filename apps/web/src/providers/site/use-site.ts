/**
 * Stackra file contract:
 * Purpose: reads the resolved site; throws a typed error when used outside the site layout, which
 *          is a programming error.
 * Boundary: the one accessor; components never read the context directly.
 * Runtime: isomorphic
 * Governing contract: ADR 0175, ADR 0232 (typed errors)
 */
import { useContext } from "react";
import { SiteContextMissingError } from "#src/errors/site-context-missing.error";
import { SiteContext } from "#src/providers/site/site.context";
import type { ResolvedSite } from "#src/server/resolve-site.server";

/** The site the layout resolved for this request. */
export function useSite(): ResolvedSite {
  const site = useContext(SiteContext);
  if (!site) throw new SiteContextMissingError();
  return site;
}
