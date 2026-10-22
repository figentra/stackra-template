/**
 * Stackra file contract:
 * Purpose: proves the remembered tenant wins when still a member, and a switch is refused while the
 *          offline queue has entries, so queued work is never stranded on a tenant the user left.
 * Boundary: unit tier, jsdom; the prefs store and the mutation queue are the testing fakes;
 *           `hydrateProvider` runs the class's `hydrate` and mounts its component.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0252, ADR 0007
 */
import { describe, expect, it } from "@stackra/testing";
import { fakeQueue } from "@stackra/query/testing";
import { act, hydrateProvider, renderHook } from "@stackra/testing/react";
import { TenantProvider } from "#src/providers/tenant/tenant.provider";
import { useActiveTenant } from "#src/providers/tenant/use-active-tenant";
import { I18n } from "#stackra/i18n";

const memberships = [
  { tenantId: "ten_a", name: "Alpha", role: "staff" },
  { tenantId: "ten_b", name: "Beta", role: "admin" },
];

/** Guards the active-tenant state that scopes every console request. */
describe(TenantProvider, () => {
  /**
   * The pref is keyed by user, so the second membership is chosen only because this user remembered
   * it.
   */
  it("starts on the remembered tenant", async () => {
    const { result } = renderHook(() => useActiveTenant(), {
      providers: [
        await hydrateProvider(TenantProvider, {
          session: { userId: "user_1", tenants: memberships },
          prefs: { "tenant.remembered": { tenantId: "ten_b" } },
        }),
      ],
    });
    expect(result.current.current?.tenantId).toBe("ten_b");
  });

  /**
   * A queued create belongs to tenant A; switching would strand it, so the hook answers with the
   * i18n key, not a switch.
   */
  it("refuses a switch while mutations are queued", async () => {
    const { result } = renderHook(() => useActiveTenant(), {
      providers: [
        await hydrateProvider(TenantProvider, {
          session: { userId: "user_1", tenants: memberships },
        }),
      ],
      queue: fakeQueue({ pending: 1 }),
    });
    let outcome: true | string = true;
    await act(async () => {
      outcome = await result.current.switchTo("ten_b");
    });
    expect(outcome).toBe(I18n.console.tenant.switch_blocked_by_queue);
  });
});
