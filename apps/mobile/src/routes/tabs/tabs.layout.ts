/**
 * Stackra file contract:
 * Purpose: the signed-in shell: the frame of the tab routes (home, orders, settings), each at the
 *          root of its own native stack under the system tab bar (UITabBarController with Liquid
 *          Glass on iOS 26, Material on Android). Its loader redirects a signed-out boot to sign-in
 *          and selects the active tenant before the first tab renders.
 * Boundary: a layout: behaviour only, in `loader`. Links point down: a route names this layout
 *           with `layout:`, the layout never imports a route (it redirects by key,
 *           `Routes.sign_in`). The tab bar's items are the routes that declare `tab`, arranged by
 *           `menus/tab-bar.menu.ts`; its look is `chrome.config.ts`. Tenant selection happens only
 *           here: the one remembered for the user in `PreferencesStore`, else their first
 *           membership; memberships come from the session's claims and roles are read, never
 *           computed. The targets are `stackra.config.ts`'s.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0295 (decision 12), ADR 0061, ADR 0206,
 *                     ADR 0208
 */
import { Layout, type LayoutContext } from "@stackra/navigation";
import type { TenantSwitcher } from "@stackra/tenancy";
import type { PreferencesStore } from "#src/stores/preferences.store";
import { Routes } from "#stackra/routes";

/** Routes with no `layout` and the default `auth` sit on the root stack above this shell. */
export class TabsLayout extends Layout {
  /**
   * @param preferences - the remembered tenant per user, read from `Prefs`.
   * @param tenants - switches the tenancy context the clients scope `X-Tenant` by.
   */
  constructor(
    private readonly preferences: PreferencesStore,
    private readonly tenants: TenantSwitcher,
  ) {
    super();
  }

  /**
   * Signed out: redirect to sign-in with `resume`, so a deep link replays after sign-in. Signed
   * in: the remembered tenant, else the first membership, so the first frame shows the right one.
   */
  override async loader(ctx: LayoutContext<this>) {
    if (!ctx.session) return ctx.redirect(Routes.sign_in, { resume: true });
    // the `Prefs` area is read before the first tab, so the choice never flickers
    await this.preferences.ready;
    const { userId, tenants } = ctx.session.user;
    const remembered = this.preferences.tenantFor(userId);
    const active = tenants.find((m) => m.tenantId === remembered) ?? tenants[0];
    if (active) await this.tenants.switchTo(active.tenantId);
    return null;
  }
}
