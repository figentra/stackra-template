/**
 * Stackra file contract:
 * Purpose: the signed-in shell: the system tab bar (UITabBarController on iOS 26 with Liquid Glass
 *          and minimize-on-scroll, Material on Android). Routes that name it with `layout:` become
 *          tab roots, each at the root of its own native stack with a large title; gen writes the
 *          tree into `#stackra/navigation`.
 * Boundary: links point down: a route names this layout, the layout never imports a route (it
 *           redirects by key, `Routes.sign_in`). Each tab route declares `tab: { order, icon, label
 *           }` (icons are `Icons` cases: SF Symbols on iOS, the brand set on Android) and gen
 *           builds the bar in `#stackra/navigation`; `guard` is behaviour and runs before any
 *           child. The targets are `stackra.config.ts`'s; a layout does not repeat them.
 * Runtime: react-native
 * Governing contract: ADR 0061, ADR 0227
 */
import { Layout, LayoutKind, type RouteContext } from "@stackra/navigation";
import { Routes } from "#stackra/routes";

/**
 * The tab bar itself; the tabs are the routes that name this layout and declare `tab`, in `order`.
 * Routes with `auth: true` and no `layout` sit on the root stack above this shell.
 */
@Layout({
  kind: LayoutKind.NativeTabs,
  // tool-owned react-native-bottom-tabs value: iOS 26 shrinks the bar on scroll
  minimizeBehavior: "onScrollDown",
  sidebarAdaptable: true, // a sidebar on iPad
  largeTitles: true, // each tab root collapses its large title into the glass header
})
export class TabsLayout {
  /**
   * Redirects to sign-in when there is no session; a deep link into a signed-out app resumes after
   * sign-in.
   */
  guard(ctx: RouteContext) {
    if (!ctx.session) return ctx.redirect(Routes.sign_in, { resume: true });
  }
}
