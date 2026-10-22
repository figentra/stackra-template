/**
 * Stackra file contract:
 * Purpose: the tenant page in the browser: the published L2 document the page route loaded,
 *          rendered after hydration.
 * Boundary: presentation over PageRoute's loader data; the renderer and the `@Block` classes decide
 *           the content. The server shows `TenantPageFallback` instead.
 * Runtime: browser
 * Governing contract: ADR 0110, ADR 0114 (every page is an L2 document)
 */
import { DocumentRenderer } from "@stackra/experience/react";
import type { RouteComponent } from "@stackra/navigation";
import type { PageRoute } from "#src/routes/page.route";

/** The document, in the browser only. */
export const TenantPage: RouteComponent<typeof PageRoute> = ({ data: { page } }) => (
  <DocumentRenderer document={page.root} />
);
