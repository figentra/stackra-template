/**
 * Stackra file contract:
 * Purpose: the hook pages use for the active tenant, its memberships and the switch; the same state
 *          shape as the console's tenant hook.
 * Boundary: a projection over the tenancy and query packages; the one hook of this provider folder.
 *           A switch is refused while queued writes wait, so no offline write is replayed against
 *           the wrong tenant.
 * Runtime: react-native
 * Governing contract: ADR 0059, ADR 0208
 */
import { useMutationQueue } from "@stackra/query/react";
import { useTenant, useTenantSwitcher, type TenantMembership } from "@stackra/tenancy/react";
import { I18n, type I18nKey } from "#stackra/i18n";

/** What the profile page reads and calls. */
export interface ActiveTenantState {
  /** The active membership, or `null` for a user with none. */
  readonly current: TenantMembership | null;
  /** Every tenant the user belongs to, the active one included. */
  readonly memberships: readonly TenantMembership[];
  /** `true` on success, or the refusal's key when queued writes would be stranded. */
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
      if (queue.pending > 0) return I18n.mobile.profile.switch_blocked_by_queue;
      await switchTo(tenantId);
      return true;
    },
  };
}
