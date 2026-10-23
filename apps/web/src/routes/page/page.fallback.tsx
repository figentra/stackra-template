/**
 * Stackra file contract:
 * Purpose: the hydrate fallback of `PageRoute`, bound by name: what the server renders for a tenant
 *          page before hydration, the title as LCP text and a skeleton where the document will
 *          appear.
 * Boundary: presentation over the route's loader data; no document rendering on the server (no
 *           document SSR in v1).
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 14: `<name>.fallback.tsx`, as amended by programming model
 *                     v3.1, AGENTS.md: class components), ADR 0110, ADR 0114
 */
import type { RouteProps } from "@stackra/navigation";
import { Component } from "#stackra/ui";
import { Skeleton } from "@stackra/ui/react";
import type { PageRoute } from "#src/routes/page/page.route";

/** What the server sends inside the frame. */
export class PageFallback extends Component<RouteProps<typeof PageRoute>> {
  /** The page title and a skeleton of the document's place. */
  render() {
    return (
      <div aria-busy="true">
        <h1 className="text-3xl font-semibold tracking-tight">{this.props.data.page.seo.title}</h1>
        <Skeleton className="mt-6 h-64 w-full rounded-panel" />
      </div>
    );
  }
}
