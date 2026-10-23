/**
 * Stackra file contract:
 * Purpose: reads the site the layout resolved for this request; throws a typed refusal when used
 *          outside the site layout, which is a programming error.
 * Boundary: the one accessor, shared by the site frame and the pricing table; it reads the site
 *           layout's loader data, so no context or provider exists for it.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 14: hooks/ with two importers), ADR 0175, ADR 0232
 */
import { useLayoutData } from "@stackra/navigation/react";
import { SiteContextMissingError } from "#src/errors/site-context-missing.error";
import type { SiteLayout } from "#src/routes/site/site.layout";
import type { ResolvedSite } from "#src/types/resolved-site.type";

/** The site the layout resolved for this request. */
export function useSite(): ResolvedSite {
  const layout = useLayoutData<typeof SiteLayout>("site");
  if (!layout) throw SiteContextMissingError.create();
  return layout.site;
}
