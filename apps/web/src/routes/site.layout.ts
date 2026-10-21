/**
 * Stackra file contract:
 * Purpose: the frame of every page: resolves the site once per request (host → tenant site, locale
 *          from the route's mount), then draws the skip link, header, footer and consent banner
 *          around the outlet.
 * Boundary: options are the declaration (component, error boundary); `resolve` is behaviour and
 *           runs before any child loader; its value reaches loaders as `ctx.site` and components
 *           through `useSite`. No guard: the public site has no session. Pages own their meta.
 * Runtime: isomorphic
 * Governing contract: ADR 0175 (sites by host), ADR 0080 (lang/dir), ADR 0071 (consent before
 *                     analytics)
 */
import { Layout, LayoutKind, type RouteContext } from "@stackra/navigation";
import { RouteError } from "#src/components/route-error";
import { SiteFrame } from "#src/components/site-frame";
import { resolveSite } from "#src/server/resolve-site.server";

/** Frame of every public page: resolves the tenant site and locale once per request. */
@Layout({ kind: LayoutKind.Site, component: SiteFrame, errorBoundary: RouteError })
export class SiteLayout {
  /**
   * The one upstream call every page shares; a 404 Response from it is the not-found page for the
   * host.
   */
  async resolve(ctx: RouteContext) {
    return { site: await resolveSite(ctx) };
  }
}
