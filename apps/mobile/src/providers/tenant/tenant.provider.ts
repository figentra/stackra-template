/**
 * Stackra file contract:
 * Purpose: chooses the active tenant for the signed-in user before the first route: the one
 *          remembered for that user in `PreferencesStore`, else their first membership. The context
 *          component receives the choice.
 * Boundary: a `@Provider` class because it runs code before mount. Selection only, and only here:
 *           memberships come from the session's claims, roles are read, never computed. The folder
 *           holds this class, `tenant.context.tsx` and `use-active-tenant.ts`, the same three files
 *           as the console's tenant folder.
 * Runtime: react-native
 * Governing contract: ADR 0208, ADR 0256, ADR 0263
 */
import { Provider, type AppContext } from "@stackra/navigation";
import type { TenantMembership } from "@stackra/tenancy";
import { TenantContextProvider } from "#src/providers/tenant/tenant.context";
import { PreferencesStore } from "#src/stores/preferences.store";

/**
 * What `hydrate` hands the context component: the active membership and every membership of the
 * user.
 */
export interface TenantSelection {
  /** The tenant every call is scoped to from the first frame. */
  readonly active: TenantMembership;
  /** Every tenant the user belongs to, the active one included. */
  readonly memberships: readonly TenantMembership[];
}

/**
 * Mounted below the session context; the query context below it scopes the cache by the active
 * tenant.
 */
@Provider({ component: TenantContextProvider, order: 20 })
export class TenantProvider {
  /** Remembered membership first; `null` for a signed-out boot or a user with no membership. */
  async hydrate(ctx: AppContext): Promise<TenantSelection | null> {
    const session = ctx.session;
    if (!session) return null;
    const preferences = ctx.store(PreferencesStore);
    // the `Prefs` area is read before the first route, so the choice never flickers
    await preferences.ready;
    const memberships = session.user.tenants;
    const remembered = preferences.tenantFor(session.user.userId);
    const active = memberships.find((m) => m.tenantId === remembered) ?? memberships[0];
    return active ? { active, memberships } : null;
  }
}
