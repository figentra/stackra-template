/**
 * Stackra file contract:
 * Purpose: `*`: any path no coded route owns: a tenant page built in the page builder. The server
 *          fetches the published document and its SEO fields through `GetDocumentQuery` (`{ path
 *          }`), so meta and the 404 are right on the first response; the document itself renders in
 *          the browser after hydration. Its page is `page.tsx` and its server stand-in
 *          `page.fallback.tsx`, both bound by name.
 * Boundary: the renderer and the Block classes decide what a document may contain; this route only
 *           fetches and places it. The query names the `page` cache profile (documents change on
 *           publish), cached per site, locale and market while the HTML stays private. `null` from
 *           the service (nothing published at the path) is the not-found page.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0297 (decision 3), ADR 0301 (decision 7),
 *                     ADR 0114 (every page is a document), ADR 0110, ADR 0112
 */
import { RenderMode, Route, type MetaContext, type RouteContext } from "@stackra/navigation";
import { OgKind, type Seo } from "@stackra/seo";
import { GetDocumentQuery } from "#stackra/clients/experience";
import { CacheProfile } from "#src/enums/cache-profile.enum";
import { SiteLayout } from "#src/routes/site/site.layout";

/** Catch-all route `*`: renders a tenant page built in the page builder from its document. */
export class PageRoute extends Route({
  path: "*",
  layout: SiteLayout,
  render: RenderMode.Client,
}) {
  /** The published document at the path, or the not-found page. */
  override async loader(ctx: RouteContext<this>) {
    const page = await ctx.query(
      GetDocumentQuery,
      { path: `/${ctx.params["*"] ?? ""}` },
      { cache: CacheProfile.Page },
    );
    if (!page) throw ctx.notFound({ code: "page_not_found" });
    return { page };
  }

  /** The document's own SEO fields; a page the tenant marked `noindex` stays out of search. */
  override meta({ data: { page }, site }: MetaContext<this>): Seo {
    return {
      title: page.seo.title,
      description: page.seo.description,
      noindex: page.seo.noindex,
      image: page.seo.image ?? `${site.origin}/og/${OgKind.Page}/${encodeURIComponent(page.key)}`,
    };
  }
}
