/**
 * Stackra file contract:
 * Purpose: chooses the active tenant for the signed-in user before the first route: the one
 *          remembered for that user, else their first membership.
 * Boundary: selection only; memberships come from the session's claims, roles are read, never
 *           computed. The folder holds this class, `tenant.context.tsx` and `use-active-tenant.ts`.
 * Runtime: browser
 * Governing contract: ADR 0208 (IAM scope tree), ADR 0256 (prefs)
 */
import { Provider, type AppContext } from "@stackra/navigation";
import { TenantContextProvider } from "#src/providers/tenant/tenant.context";
import { RememberedTenant } from "#src/schemas/remembered-tenant.schema";

/** Chooses the active tenant for the signed-in user before the first route. */
@Provider({ component: TenantContextProvider, order: 20 })
export class TenantProvider {
  /**
   * Remembered membership first; `null` signed out or with no membership (the switcher shows the
   * empty state).
   */
  async hydrate(ctx: AppContext) {
    const session = ctx.session;
    if (!session) return null;
    const memberships = session.user.tenants;
    const remembered = await ctx.prefs.read(RememberedTenant, { tenantId: undefined });
    const active = memberships.find((m) => m.tenantId === remembered.tenantId) ?? memberships[0];
    return active ? { active, memberships } : null;
  }
}
