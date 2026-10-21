/**
 * Stackra file contract:
 * Purpose: the switcher's hook: the active tenant, every membership, and a guarded `switchTo`; the
 *          same `ActiveTenantState` shape as the mobile app's `useActiveTenant`.
 * Boundary: one rule beyond the tenancy package: a switch is refused while the offline queue of the
 *           current tenant holds entries (a switch never drops queued work). The queue is scoped
 *           per tenant by the query provider.
 * Runtime: browser
 * Governing contract: ADR 0208, ADR 0252
 */
import { useMutationQueue } from "@stackra/query/react";
import { useTenant, useTenantSwitcher, type TenantMembership } from "@stackra/tenancy/react";
import { I18n, type I18nKey } from "#stackra/i18n";

/** What the switcher renders and calls. */
export interface ActiveTenantState {
  /** The active membership, or `null` for a user with none. */
  readonly current: TenantMembership | null;
  /** Every membership of the signed-in user, in the order the session lists them. */
  readonly memberships: readonly TenantMembership[];
  /** `true` on success, or the refusal's i18n key when queued mutations would be stranded. */
  readonly switchTo: (tenantId: string) => Promise<true | I18nKey>;
}

/** Re-renders when the active tenant or the queue length changes, nothing else. */
export function useActiveTenant(): ActiveTenantState {
  const current = useTenant({ optional: true });
  const { memberships, switchTo } = useTenantSwitcher();
  const queue = useMutationQueue();
  return {
    current: current ?? null,
    memberships,
    switchTo: async (tenantId) => {
      if (queue.pending > 0) return I18n.console.tenant.switch_blocked_by_queue;
      await switchTo(tenantId);
      return true;
    },
  };
}
