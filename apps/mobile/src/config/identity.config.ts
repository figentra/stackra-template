/**
 * Stackra file contract:
 * Purpose: one fact: how the app authenticates (the app variant of identity config): the callback
 *          path under the app scheme, the scopes and the idle rule for the PKCE flow in the system
 *          browser against ZITADEL.
 * Boundary: a native client has exactly one flow, authorization code with PKCE, so there is no flow
 *           switch. The issuer and client id are the public env (`MobileEnv`), never here; no
 *           secret exists on a native client. The deep-link scheme is `release.config.ts`. There is
 *           no login UI: the sign-in page opens the hosted page. Tokens live in the secure-store
 *           session store with a rotated refresh token.
 * Runtime: isomorphic
 * Governing contract: ADR 0206, ADR 0241
 */
import { Config } from "@stackra/config";
import { Bool, Int, List, Str } from "@stackra/validation";

/**
 * Gen writes `<release.scheme>://<nativeRedirectPath>` as the redirect URI and filters it out of
 * navigation.
 */
@Config("mobile.identity")
export class IdentityConfig {
  /**
   * The custom-scheme redirect path, registered on the ZITADEL native app. @defaultValue
   * "auth/callback"
   */
  @Str({ pattern: /^[a-z][a-z0-9/-]*$/ }) nativeRedirectPath = "auth/callback";
  /** Scopes requested at login; the roles scope feeds the IAM claims (ADR 0208). */
  @List(Str) scopes: string[] = [
    "openid",
    "profile",
    "email",
    "offline_access",
    "urn:zitadel:iam:org:projects:roles",
  ];
  /** Minutes of inactivity before a forgotten shared device signs out. @defaultValue 30 */
  @Int({ min: 5 }) idleMinutes = 30;
  /** Refresh the access token when the app returns to the foreground. @defaultValue true */
  @Bool() refreshOnForeground = true;
}
