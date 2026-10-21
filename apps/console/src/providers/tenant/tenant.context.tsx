/**
 * Stackra file contract:
 * Purpose: mounts the tenancy provider with the active membership `TenantProvider.hydrate` chose,
 *          so the generated clients send `X-Tenant` and `useActiveTenant` works below.
 * Boundary: the server re-checks membership on every call: the header is a hint, not an authority.
 *           Signed out renders the children without a tenant.
 * Runtime: browser
 * Governing contract: ADR 0208 (memberships), ADR 0256 (prefs)
 */
import type { ReactNode } from "react";
import { usePrefs } from "@stackra/storage/react";
import { TenancyProvider, type TenantMembership } from "@stackra/tenancy/react";
import { RememberedTenant } from "#src/schemas/remembered-tenant.schema";

/** The hydrated value and the tree. */
export interface TenantContextProviderProps {
  /**
   * From `TenantProvider.hydrate`: the active membership and every membership; `null` when signed
   * out.
   */
  readonly value: {
    readonly active: TenantMembership;
    readonly memberships: readonly TenantMembership[];
  } | null;
  /** The app subtree whose generated clients send `X-Tenant`. */
  readonly children: ReactNode;
}

/** A switch remembers the choice per user, so a shared till forgets nothing across users. */
export function TenantContextProvider({ value, children }: TenantContextProviderProps) {
  const prefs = usePrefs();
  if (!value) return <>{children}</>;
  return (
    <TenancyProvider
      tenant={value.active}
      memberships={value.memberships}
      onSwitch={(tenantId) => prefs.write(RememberedTenant, { tenantId })}
    >
      {children}
    </TenancyProvider>
  );
}
