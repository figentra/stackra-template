/**
 * Stackra file contract:
 * Purpose: the tenant page in the browser, bound to `PageRoute` by name: the published document the
 *          route loaded, rendered after hydration.
 * Boundary: presentation over the route's loader data; the renderer and the Block classes decide
 *           the content. The server shows `page.fallback.tsx` instead.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 7 and 14, as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0110, ADR 0114 (every page is a document)
 */
import { DocumentRenderer } from "@stackra/experience/react";
import type { RouteProps } from "@stackra/navigation";
import { Component } from "#stackra/ui";
import type { PageRoute } from "#src/routes/page/page.route";

/** The document, in the browser only. */
export class Page extends Component<RouteProps<typeof PageRoute>> {
  /** The published document's tree. */
  render() {
    return <DocumentRenderer document={this.props.data.page.root} />;
  }
}
