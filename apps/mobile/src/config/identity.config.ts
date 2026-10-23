/**
 * Stackra file contract:
 * Purpose: this app's override of @stackra/identity's configuration: how the app authenticates.
 *          The ZITADEL issuer and native client, the callback path under the app scheme, the scopes
 *          and the idle rule of the authorization-code flow with PKCE in the system browser.
 * Boundary: an override declares `override` members only and inherits the base's key; its presence
 *           mounts the session context (tokens in the secure-store session store, refresh token
 *           rotated by the package), so the app writes no session provider. A native client has
 *           exactly one flow, so there is no flow switch, and it holds no client credential: the
 *           issuer and the public client id are env values. The scheme is `stackra.config.ts`
 *           `scheme`; gen writes `<scheme>://<nativeRedirectPath>` as the redirect URI and filters
 *           it out of navigation. There is no login UI: the sign-in page opens the hosted page.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 19), ADR 0295 (decision 10), ADR 0206, ADR 0241
 */
import { Env } from "@stackra/config";
import type { Url } from "@stackra/contracts";
import { IdentityConfig } from "@stackra/identity";

/** PKCE against the project's ZITADEL; a shared device signs out after half an hour idle. */
export class MobileIdentityConfig extends IdentityConfig {
  /** ZITADEL issuer; the PKCE flow discovers its endpoints from it. */
  @Env("EXPO_PUBLIC_ZITADEL_ISSUER")
  override issuer!: Url;

  /** ZITADEL native-app client id: a public client, PKCE, no client credential. */
  @Env("EXPO_PUBLIC_ZITADEL_CLIENT_ID")
  override clientId!: string;

  /** The custom-scheme redirect path, registered on the ZITADEL native app. */
  override nativeRedirectPath = "auth/callback";

  /** Scopes requested at sign-in; the roles scope feeds the IAM claims (ADR 0208). */
  override scopes = [
    "openid",
    "profile",
    "email",
    "offline_access",
    "urn:zitadel:iam:org:projects:roles",
  ];

  /** Minutes of inactivity before a forgotten shared device signs out; the queue only pauses. */
  override idleMinutes = 30;

  /** Refresh the access token when the app returns to the foreground. */
  override refreshOnForeground = true;
}
