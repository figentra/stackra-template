/**
 * Stackra file contract:
 * Purpose: the signed-in frame: sidebar from the generated navigation, the top bar, the offline
 *          banner, the palette; child routes name it with `layout: ShellLayout` and the generated
 *          resource routes are nested in it too.
 * Boundary: options are the declaration (component, error boundary, targets); `guard` is behaviour
 *           and runs before any child loader. Links point down: routes name this layout, the layout
 *           never imports a route (it redirects by key, `Routes.sign_in`); the bottom tabs on a
 *           phone-sized PWA are the routes that declare `tab`, built by gen into
 *           `#stackra/navigation`.
 * Runtime: browser
 * Governing contract: ADR 0164 (panel shell), ADR 0214 (gate-filtered navigation), ADR 0241
 *                     (session guard)
 */
import { Layout, LayoutKind, type RouteContext } from "@stackra/navigation";
import { Target } from "@stackra/platform";
import { Shell } from "#src/components/shell";
import { RouteErrorState } from "#src/components/error-state";
import { Routes } from "#stackra/routes";

/** Signed-in frame: generated navigation sidebar, top bar, offline banner and command palette. */
@Layout({
  kind: LayoutKind.Shell,
  component: Shell,
  errorBoundary: RouteErrorState,
  targets: [Target.Web, Target.Pwa, Target.Desktop],
})
export class ShellLayout {
  /**
   * No session → the sign-in route with the current path as `returnTo`; child routes still check
   * their own `permission`.
   */
  guard(ctx: RouteContext) {
    if (!ctx.session) return ctx.redirect(Routes.sign_in, { search: { returnTo: ctx.path } });
  }
}
