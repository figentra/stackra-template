/**
 * Stackra file contract:
 * Purpose: the component that mounts the identity package's session provider with the hydrated
 *          value: BFF cookie session on web and PWA, PKCE on desktop, idle sign-out.
 * Boundary: the console never sees a token or a password; `@stackra/identity/react` talks to
 *           `/api/auth/*`. The value arrives from `SessionProvider.hydrate`; the component only
 *           mounts it. Config is read through `useConfig`.
 * Runtime: browser
 * Governing contract: ADR 0206 d8, ADR 0241
 */
import type { ReactNode } from "react";
import { useConfig } from "@stackra/config/react";
import { IdentitySessionProvider, type SessionValue } from "@stackra/identity/react";
import { env } from "#stackra/env";
import { IdentityConfig } from "#src/config/identity.config";

/** What the generated provider stack passes: the hydrated value and the tree. */
export interface SessionContextProviderProps {
  /** From `SessionProvider.hydrate`; `null` when there is no session yet. */
  readonly value: SessionValue | null;
  /** The app subtree that reads the session through `useActor`. */
  readonly children: ReactNode;
}

/**
 * On a 401 from any generated client the state flips to signed out; the layout guard then sends the
 * browser to the sign-in route. The flow per target is config, never a branch here.
 */
export function SessionContextProvider({ value, children }: SessionContextProviderProps) {
  const identity = useConfig(IdentityConfig);
  return (
    <IdentitySessionProvider
      initial={value}
      endpoint={`${env.apiOrigin}${identity.bffEndpoint}`}
      flow={identity.flow[env.target.value]}
      idleMinutes={identity.idleMinutes}
      refreshOnFocus={identity.refreshOnFocus}
    >
      {children}
    </IdentitySessionProvider>
  );
}
