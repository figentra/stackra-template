/**
 * Stackra file contract:
 * Purpose: proves the hook reports the tenant the user remembered while still a member, and refuses
 *          a switch while the offline queue has entries, so queued work is never stranded on a
 *          tenant the user left.
 * Boundary: unit tier, jsdom; the tenancy context is the package's, mounted by the testing
 *           providers from the session and the prefs store; the mutation queue is the testing fake.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0252, ADR 0007
 */
import { fakeQueue } from "@stackra/query/testing";
import { describe, expect, it } from "@stackra/testing";
import { act, renderHook } from "@stackra/testing/react";
import { I18n } from "#stackra/i18n";
import { useActiveTenant } from "#src/components/tenant-switcher/use-active-tenant";

/** Two memberships of one user. */
const memberships = [
  { tenantId: "ten_a", name: "Alpha", role: "staff" },
  { tenantId: "ten_b", name: "Beta", role: "admin" },
];

/** Guards the active-tenant state that scopes every console request. */
describe(useActiveTenant, () => {
  /**
   * The pref is keyed by user, so the second membership is chosen only because this user remembered
   * it.
   */
  it("starts on the remembered tenant", () => {
    const { result } = renderHook(() => useActiveTenant(), {
      session: { userId: "user_1", tenants: memberships },
      prefs: { "tenancy.remembered": { tenantId: "ten_b" } },
    });
    expect(result.current.current?.tenantId).toBe("ten_b");
  });

  /**
   * A queued create belongs to tenant A; switching would strand it, so the hook answers with the
   * i18n key, not a switch.
   */
  it("refuses a switch while mutations are queued", async () => {
    const { result } = renderHook(() => useActiveTenant(), {
      session: { userId: "user_1", tenants: memberships },
      queue: fakeQueue({ pending: 1 }),
    });
    let outcome: true | string = true;
    await act(async () => {
      outcome = await result.current.switchTo("ten_b");
    });
    expect(outcome).toBe(I18n.console.tenant.switch_blocked_by_queue);
  });
});
