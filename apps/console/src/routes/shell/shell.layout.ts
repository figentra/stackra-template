/**
 * Stackra file contract:
 * Purpose: the signed-in frame: child routes name it with `layout: ShellLayout`, and the panel
 *          routes gen derives from the consumed resources, documents and settings pages are nested
 *          in it too. Its component is `shell.tsx` beside it, bound by name.
 * Boundary: the options are the declaration (targets); the loader is behaviour and runs before any
 *           child loader, so a protected loader never sees a sessionless request. Links point down:
 *           routes name this layout, the layout never imports a route (it redirects by key,
 *           `Routes.sign_in`). The bottom tabs of a phone-sized PWA are the routes that declare
 *           `tab`, built by gen into `#stackra/navigation`. An error below it bubbles to
 *           `src/app.error.tsx`.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0164 (panel shell), ADR 0214
 *                     (gate-filtered navigation), ADR 0241 (session check)
 */
import { Target } from "@stackra/contracts";
import { Layout, type RouteContext } from "@stackra/navigation";
import { Routes } from "#stackra/routes";

/** Signed-in frame on every console target: navigation, top bar, offline banner and palette. */
export class ShellLayout extends Layout({
  targets: [Target.Web, Target.Pwa, Target.Desktop],
}) {
  /**
   * No session → the sign-in route with the current path as `returnTo`; child routes still check
   * their own permission.
   */
  override loader(ctx: RouteContext<this>) {
    if (!ctx.session) return ctx.redirect(Routes.sign_in, { search: { returnTo: ctx.path } });
    return null;
  }
}
