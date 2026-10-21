/**
 * Stackra file contract:
 * Purpose: feature flags for the signed-in user and the active tenant, evaluated once per session
 *          and refreshed on the configured interval.
 * Boundary: a context component with no behaviour before mount. A flag is a release switch, never a
 *           commercial right. The targeting context is ids only; rules live server-side; kill
 *           switches cannot be overridden here.
 * Runtime: react-native
 * Governing contract: ADR 0081, ADR 0213
 */
import { useConfig } from "@stackra/config/react";
import { FeatureFlagsProvider } from "@stackra/feature-flags/react";
import { useSession } from "@stackra/identity/react";
import { useTenant } from "@stackra/tenancy/react";
import type { ReactNode } from "react";
import { SessionStatus } from "@stackra/identity";
import { FeatureFlagsConfig } from "#src/config/feature-flags.config";

/** The provider takes only the subtree it wraps. */
export interface FlagsContextProviderProps {
  /** The tree that may call `useFlag`. */
  readonly children: ReactNode;
}

/** Targeting: the user id and the tenant id. */
export function FlagsContextProvider({ children }: FlagsContextProviderProps) {
  const config = useConfig(FeatureFlagsConfig);
  const session = useSession();
  const tenant = useTenant({ optional: true });
  const context = {
    userId: session.status === SessionStatus.SignedIn ? session.user.userId : undefined,
    tenantId: tenant?.tenantId,
  };
  return (
    <FeatureFlagsProvider config={config} context={context}>
      {children}
    </FeatureFlagsProvider>
  );
}
