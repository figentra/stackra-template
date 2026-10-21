/**
 * Stackra file contract:
 * Purpose: feature flags for the signed-in user and active tenant, evaluated once per session and
 *          refreshed on change.
 * Boundary: a context component without behaviour before mount, so no `@Provider` class exists. A
 *           flag is a release switch, never a commercial right. The targeting context is ids only;
 *           kill switches cannot be overridden by the client.
 * Runtime: browser
 * Governing contract: ADR 0213 d3, ADR 0081 (gate chain)
 */
import type { ReactNode } from "react";
import { FeatureFlagsProvider } from "@stackra/feature-flags/react";
import { useTenant } from "@stackra/tenancy/react";
import { env } from "#stackra/env";
import { useActor } from "#src/providers/session/use-actor";

/** The provider's props. */
export interface FlagsContextProviderProps {
  /** The app subtree whose routes, menu items and components evaluate flags. */
  readonly children: ReactNode;
}

/**
 * Targets by user id, tenant id and client target; signed out evaluates every flag at its default.
 */
export function FlagsContextProvider({ children }: FlagsContextProviderProps) {
  const { actor } = useActor();
  const tenant = useTenant({ optional: true });
  const context = { userId: actor?.userId, tenantId: tenant?.tenantId, target: env.target };
  return <FeatureFlagsProvider context={context}>{children}</FeatureFlagsProvider>;
}
