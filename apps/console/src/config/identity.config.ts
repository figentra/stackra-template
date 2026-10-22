/**
 * Stackra file contract:
 * Purpose: one fact: how the console authenticates. The BFF cookie session on web and PWA, PKCE
 *          through the system browser on desktop, the idle rule and the scopes.
 * Boundary: no client secret exists on a browser client; the issuer and client id come from the
 *           BFF's discovery endpoint. The sign-in route is the `SignInRoute` class, referenced by
 *           the layout guard, not a path here. The PKCE loopback port is a dev fact in runway.yaml.
 * Runtime: isomorphic
 * Governing contract: ADR 0206 d8 (BFF on web, PKCE on desktop), ADR 0241 (central login, BFF
 *                     scope)
 */
import { Config } from "@stackra/config";
import { Target } from "@stackra/contracts";
import { AuthFlow } from "@stackra/identity";
import { Bool, Int, List, Map, OneOf, Str } from "@stackra/validation";
import { Routes } from "#stackra/routes";

/** How the console authenticates: BFF cookie session on web and PWA, PKCE on desktop. */
@Config("console.identity")
export class IdentityConfig {
  /**
   * Flow per target: an HttpOnly cookie session, or the system browser with a loopback redirect.
   */
  @Map(OneOf(AuthFlow)) flow: Record<string, AuthFlow> = {
    [Target.Web.value]: AuthFlow.Bff,
    [Target.Pwa.value]: AuthFlow.Bff,
    [Target.Desktop.value]: AuthFlow.Pkce,
  };
  /** The BFF mount, relative to the API origin. @defaultValue "/api/auth" */
  @Str({ pattern: /^\/api\/auth/ }) bffEndpoint = "/api/auth";
  /**
   * Where the browser lands after signing out, as a route ref so a removed route is a type error;
   * signed out, the shell's guard sends it on to sign in. @defaultValue Routes.dashboard
   */
  postLogoutRoute = Routes.dashboard;
  /** Signs out a forgotten shared till; the queue pauses, never drops. @defaultValue 30 */
  @Int({ min: 5 }) idleMinutes = 30;
  /** Re-reads the session when the window regains focus. @defaultValue true */
  @Bool() refreshOnFocus = true;
  /**
   * OAuth scopes the BFF requests.
   * @defaultValue ["openid", "profile", "email", "offline_access"]
   */
  @List(Str) scopes: string[] = ["openid", "profile", "email", "offline_access"];
  /**
   * Desktop: `<deepLinks.scheme>://auth/callback` completes the PKCE flow.
   * @defaultValue "auth/callback"
   */
  @Str() nativeRedirectPath = "auth/callback";
}
