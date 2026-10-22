/**
 * Stackra file contract:
 * Purpose: `*`: any path no coded route owns: a tenant page built in the page builder. The server
 *          fetches the published document and its SEO fields through
 *          `Experience.queries.GetDocument({ path })`, so meta and the 404 are right on the first
 *          response; the document itself renders in the browser after hydration.
 * Boundary: the renderer and the `@Block` classes decide what a document may contain; this route
 *           only fetches and places it. `null` from the service (nothing published at the path) is
 *           the not-found page.
 * Runtime: isomorphic
 * Governing contract: ADR 0114 (every page is an L2 document), ADR 0110, ADR 0112
 */
import { RenderMode, Route, type MetaContext, type RouteContext } from "@stackra/navigation";
import { OgKind, type Seo } from "@stackra/seo";
import { Experience } from "#stackra/clients";
import { TenantPage } from "#src/components/pages/page";
import { TenantPageFallback } from "#src/components/pages/tenant-page-fallback";
import { CacheProfile } from "#src/enums/cache-profile.enum";
import { SiteLayout } from "#src/routes/site.layout";

/**
 * Catch-all route `*`: renders a tenant page built in the page builder from its published document.
 */
@Route({
  path: "*",
  layout: SiteLayout,
  render: RenderMode.Client,
  hydrateFallback: TenantPageFallback,
  cache: CacheProfile.Page,
  component: TenantPage,
})
export class PageRoute {
  /** The published document at the path, or the not-found page. */
  async loader(ctx: RouteContext) {
    const page = await ctx.query(Experience.queries.GetDocument, {
      path: `/${ctx.params["*"] ?? ""}`,
    });
    if (!page) throw ctx.notFound({ code: "page_not_found" });
    return { page };
  }

  /** The document's own SEO fields; a page the tenant marked `noindex` stays out of search. */
  meta({ data: { page }, site }: MetaContext<PageRoute>): Seo {
    return {
      title: page.seo.title,
      description: page.seo.description,
      noindex: page.seo.noindex,
      image:
        page.seo.image ?? `${site.origin}/og/${OgKind.Page.value}/${encodeURIComponent(page.key)}`,
    };
  }
}
