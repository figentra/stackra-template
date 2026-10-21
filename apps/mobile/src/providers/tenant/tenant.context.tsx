/**
 * Stackra file contract:
 * Purpose: the React side of the tenant provider: mounts the tenancy context with the membership
 *          `TenantProvider` chose, so the clients send `X-Tenant` and `useActiveTenant` reads it;
 *          remembers a switch per user.
 * Boundary: no selection logic here (that is `tenant.provider.ts`); the remembered choice is
 *           written through the store's method, never directly.
 * Runtime: react-native
 * Governing contract: ADR 0079, ADR 0208
 */
import { useSession } from "@stackra/identity/react";
import { useStore } from "@stackra/state/react";
import { TenancyProvider } from "@stackra/tenancy/react";
import type { ReactNode } from "react";
import { SessionStatus } from "@stackra/identity";
import type { TenantSelection } from "#src/providers/tenant/tenant.provider";
import { PreferencesStore } from "#src/stores/preferences.store";

/** The hydrated selection and the tree. */
export interface TenantContextProviderProps {
  /** What `TenantProvider.hydrate` returned; `null` signed out or without a membership. */
  readonly value: TenantSelection | null;
  /** The tree that may read `useActiveTenant()`. */
  readonly children: ReactNode;
}

/** Signed out or without a membership, the children render without a tenant. */
export function TenantContextProvider({ value, children }: TenantContextProviderProps) {
  const session = useSession();
  const preferences = useStore(PreferencesStore);
  if (!value || session.status !== SessionStatus.SignedIn) return <>{children}</>;
  return (
    <TenancyProvider
      initialTenant={value.active}
      memberships={value.memberships}
      onSwitch={(tenantId) => preferences.rememberTenant(session.user.userId, tenantId)}
    >
      {children}
    </TenancyProvider>
  );
}
