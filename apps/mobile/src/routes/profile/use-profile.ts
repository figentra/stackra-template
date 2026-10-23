/**
 * Stackra file contract:
 * Purpose: the profile page's state: the session's user, asserted; the active tenant, its
 *          memberships and the switch, remembered per user.
 * Boundary: used by the profile page, so it sits in its route folder. The generated navigation
 *           never mounts a route that needs a session while signed out, so a signed-out state here
 *           is a programming error, raised as `SessionRequiredError` instead of rendering half a
 *           page. A switch is refused while queued writes wait, so no offline write is replayed
 *           against the wrong tenant; an accepted switch is remembered in `PreferencesStore`, which
 *           the tabs layout reads on the next launch.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 14), ADR 0059, ADR 0206, ADR 0208, ADR 0232
 */
import { SessionStatus } from "@stackra/identity";
import { type SignedInSession, useSession } from "@stackra/identity/react";
import { useMutationQueue } from "@stackra/query/react";
import { useStore } from "@stackra/state/react";
import { type TenantMembership, useTenant, useTenantSwitcher } from "@stackra/tenancy/react";
import { SessionRequiredError } from "#src/errors/session-required.error";
import { PreferencesStore } from "#src/stores/preferences.store";
import { I18n, type I18nKey } from "#stackra/i18n";

/** What the profile page reads and calls. */
export interface ProfileState {
  /** The signed-in user. */
  readonly user: SignedInSession["user"];
  /** The active membership, or `null` for a user with none. */
  readonly current: TenantMembership | null;
  /** Every tenant the user belongs to, the active one included. */
  readonly memberships: readonly TenantMembership[];
  /** `true` on success, or the refusal's key when queued writes would be stranded. */
  readonly switchTo: (tenantId: string) => Promise<true | I18nKey>;
}

/**
 * The profile hook; re-renders when the session, the active tenant or the queue length changes.
 * @throws SessionRequiredError when a page that needs a session renders signed out.
 */
export function useProfile(): ProfileState {
  const session = useSession();
  const current = useTenant({ optional: true });
  const { memberships, switchTo } = useTenantSwitcher();
  const queue = useMutationQueue();
  const preferences = useStore(PreferencesStore);
  if (session.status !== SessionStatus.SignedIn) throw SessionRequiredError.create();
  const { user } = session;

  return {
    user,
    current: current ?? null,
    memberships,
    switchTo: async (tenantId) => {
      if (queue.pending > 0) return I18n.mobile.profile.switch_blocked_by_queue;
      await switchTo(tenantId);
      preferences.rememberTenant(user.userId, tenantId);
      return true;
    },
  };
}
