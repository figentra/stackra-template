/**
 * Stackra file contract:
 * Purpose: what the server renders for a tenant page before hydration: the title as LCP text and a
 *          skeleton where the document will appear.
 * Boundary: presentation over PageRoute's loader data; no document rendering on the server (no L2
 *           SSR in v1).
 * Runtime: isomorphic
 * Governing contract: ADR 0110, ADR 0114
 */
import type { RouteComponent } from "@stackra/navigation";
import { Skeleton } from "@stackra/ui";
import type { PageRoute } from "#src/routes/page.route";

/** What the server sends inside the frame. */
export const TenantPageFallback: RouteComponent<typeof PageRoute> = ({ data: { page } }) => (
  <div aria-busy="true">
    <h1 className="text-3xl font-semibold tracking-tight">{page.seo.title}</h1>
    <Skeleton className="mt-6 h-64 w-full rounded-panel" />
  </div>
);
