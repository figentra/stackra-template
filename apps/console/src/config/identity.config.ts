/**
 * Stackra file contract:
 * Purpose: the console's override of @stackra/identity's configuration: how the console
 *          authenticates. The BFF cookie session on web and PWA, PKCE through the system browser on
 *          desktop, the idle rule and the scopes.
 * Boundary: an override declares `override` members only and inherits the base's key (`identity`).
 *           The session context `createApp` mounts reads it: it asks the BFF for the session before
 *           the first route, reports any failure except "signed out" and boots signed out, and
 *           flips to signed out on a 401 from any generated client. No client secret exists on a
 *           browser client; the issuer and client id come from the BFF's discovery endpoint. The
 *           sign-in route is `SignInRoute`, which the shell's loader redirects to by key. Sign-out keeps
 *           the base's `postLogoutRoute` (`null`, the sign-in route): a route ref is no gen constant,
 *           and the shell's loader would send a signed-out dashboard to sign in anyway. The PKCE
 *           loopback port is a dev fact in runway.yaml. The class keeps the base's name and imports
 *           the base as `BaseIdentityConfig`; a second override of the same base fails gen.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 19; as amended by programming model v3.1, AGENTS.md: the
 *                     Base alias), ADR 0295 (decision 10), ADR 0206 d8 (BFF on web, PKCE on
 *                     desktop), ADR 0241 (central login, BFF scope)
 */
import { Target } from "@stackra/contracts";
import { AuthFlow, IdentityConfig as BaseIdentityConfig } from "@stackra/identity";

/** How the console authenticates: BFF cookie session on web and PWA, PKCE on desktop. */
export class IdentityConfig extends BaseIdentityConfig {
  /** Flow per target: an HttpOnly cookie session, or the system browser and a loopback redirect. */
  override flow: Record<string, AuthFlow> = {
    [Target.Web]: AuthFlow.Bff,
    [Target.Pwa]: AuthFlow.Bff,
    [Target.Desktop]: AuthFlow.Pkce,
  };

  /** The BFF mount, relative to the API origin. */
  override bffEndpoint = "/api/auth";

  /** Signs out a forgotten shared till after 30 minutes; the queue pauses, never drops. */
  override idleMinutes = 30;

  /** Re-reads the session when the window regains focus. */
  override refreshOnFocus = true;

  /** OAuth scopes the BFF requests. */
  override scopes = ["openid", "profile", "email", "offline_access"];

  /** Desktop: `<deepLinks.scheme>://auth/callback` completes the PKCE flow. */
  override nativeRedirectPath = "auth/callback";
}
