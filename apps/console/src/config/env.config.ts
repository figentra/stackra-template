/**
 * Stackra file contract:
 * Purpose: the env contract of the console, referenced by `stackra.config.ts` `env`. Every field is
 *          public and inlined into the bundle (`VITE_`); values per environment come from
 *          `runway.yaml` `environments.<env>.vars`.
 * Boundary: no secret (a browser client holds none), no `.env`, no default URL. The desktop update
 *           feed is not env: gen derives it from the root feed origin, the member's feed path and
 *           the environment's channel.
 * Runtime: isomorphic
 * Governing contract: ADR 0231 d4 (prefixes), ADR 0173 (no values in files)
 */
import { Config, Env } from "@stackra/config";
import { Target } from "@stackra/platform";
import { OneOf, Str, Url } from "@stackra/validation";

/** Read as `env` from `#stackra/env`, validated once at boot. */
@Config("console.env")
export class ConsoleEnv {
  /**
   * Which target is being built; set by `stackra build --target`, never by hand.
   * @defaultValue Target.Web
   */
  @Env("VITE_TARGET") @OneOf(Target) target = Target.Web;
  /**
   * Origin of the gateway and the BFF; empty means same origin. On-prem changes this one value.
   * @defaultValue ""
   */
  @Env("VITE_API_ORIGIN") @Url({ allowEmpty: true }) apiOrigin = "";
  /** Realtime origin; empty means the API origin. @defaultValue "" */
  @Env("VITE_REALTIME_ORIGIN") @Url({ allowEmpty: true }) realtimeOrigin = "";
  /**
   * Sentry DSN of the console; empty disables browser error reporting. Public by design.
   * @defaultValue ""
   */
  @Env("VITE_SENTRY_DSN") @Str() sentryDsn = "";
  /**
   * VAPID public key for Web Push; empty disables push. The private half is a runway secret.
   * @defaultValue ""
   */
  @Env("VITE_WEB_PUSH_VAPID_PUBLIC_KEY") @Str() vapidPublicKey = "";
  /**
   * PostHog project key for flags and analytics; empty keeps both on their local drivers.
   * @defaultValue ""
   */
  @Env("VITE_POSTHOG_KEY") @Str() posthogKey = "";
}
