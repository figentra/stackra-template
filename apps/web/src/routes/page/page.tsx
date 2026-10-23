/**
 * Stackra file contract:
 * Purpose: the tenant page in the browser, bound to `PageRoute` by name: the published document
 *          the route loaded, rendered after hydration.
 * Boundary: presentation over the route's loader data; the renderer and the Block classes decide
 *           the content. The server shows `page.fallback.tsx` instead.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 7 and 14), ADR 0110, ADR 0114 (every page is a document)
 */
import { DocumentRenderer } from "@stackra/experience/react";
import type { RouteComponent } from "@stackra/navigation";
import type { PageRoute } from "#src/routes/page/page.route";

/** The document, in the browser only. */
export const Page: RouteComponent<typeof PageRoute> = ({ data: { page } }) => (
  <DocumentRenderer document={page.root} />
);
