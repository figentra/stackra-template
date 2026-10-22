/**
 * Stackra file contract:
 * Purpose: the signed-in session over ZITADEL: authorization code with PKCE in the system browser,
 *          tokens in the secure-store session store, refresh token rotated by the identity module,
 *          idle sign-out.
 * Boundary: a context component with no behaviour before mount, so the folder has no
 *           `session.provider.ts`; `@App({ providers })` lists this component. Config is read with
 *           `useConfig` (`IdentityConfig`, `ReleaseConfig` for the scheme, `MobileEnv` for issuer
 *           and client id). There is no login UI. Tokens never reach JavaScript state beyond the
 *           identity module.
 * Runtime: react-native
 * Governing contract: ADR 0206, ADR 0263
 */
import { useConfig } from "@stackra/config/react";
import { IdentitySessionProvider } from "@stackra/identity/native";
import * as Linking from "expo-linking";
import type { ReactNode } from "react";
import { MobileEnv } from "#src/config/env.config";
import { IdentityConfig } from "#src/config/identity.config";
import { ReleaseConfig } from "#src/config/release.config";

/** Children only; issuer and client id come from the env, the rest from config. */
export interface SessionContextProviderProps {
  /** The tree that may read `useSession()`. */
  readonly children: ReactNode;
}

/**
 * Mounts the identity session. `useSession` below it reports `loading`, `signed_out` or
 * `signed_in`.
 */
export function SessionContextProvider({ children }: SessionContextProviderProps) {
  const env = useConfig(MobileEnv);
  const identity = useConfig(IdentityConfig);
  const release = useConfig(ReleaseConfig);
  return (
    <IdentitySessionProvider
      oidc={{
        issuer: env.zitadelIssuer,
        clientId: env.zitadelClientId,
        // acme://auth/callback, registered on the ZITADEL native app
        redirectUri: Linking.createURL(identity.nativeRedirectPath, { scheme: release.scheme }),
        postLogoutRedirectUri: Linking.createURL("/", { scheme: release.scheme }),
        scopes: identity.scopes,
      }}
      idleMinutes={identity.idleMinutes} // the queue pauses on sign-out, never drops
      refreshOnForeground={identity.refreshOnForeground}
    >
      {children}
    </IdentitySessionProvider>
  );
}
