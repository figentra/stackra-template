/**
 * Stackra file contract:
 * Purpose: the env contract of the console, referenced by `stackra.config.ts` `env`. Every field is
 *          public and inlined into the bundle (`VITE_`); values per environment come from
 *          `runway.yaml` `environments.<env>.vars`. The contexts `createApp` mounts read these
 *          fields by name: the generated clients and the session the API origin, realtime its
 *          origin, the reporter the DSN, push the VAPID key, analytics and flags the PostHog key.
 * Boundary: the console's own config class (key `console.env`). No secret (a browser client holds
 *           none), no `.env`, no default URL. The desktop update feed is not env: gen derives it
 *           from the root feed origin, the member's feed path and the environment's channel.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 19 and 20), ADR 0295 (decisions 2 and 10), ADR 0231 d4
 *                     (prefixes), ADR 0173 (no values in files)
 */
import { Config, Env } from "@stackra/config";
import { Target } from "@stackra/contracts";
import { Str } from "@stackra/validation";

/** Read as `env` from `#stackra/env`, validated once at boot. */
export class ConsoleEnvConfig extends Config {
  /** Which target is being built; set by `stackra build --target`, never by hand. */
  @Env("VITE_TARGET")
  target: Target = Target.Web;

  /** Origin of the gateway and the BFF; empty means same origin. On-prem changes this one value. */
  @Env("VITE_API_ORIGIN")
  @Str({ pattern: /^(https?:\/\/[^/\s]+)?$/ })
  apiOrigin = "";

  /** Realtime origin; empty means the API origin. */
  @Env("VITE_REALTIME_ORIGIN")
  @Str({ pattern: /^(https?:\/\/[^/\s]+)?$/ })
  realtimeOrigin = "";

  /** Sentry DSN of the console; empty disables browser error reporting. Public by design. */
  @Env("VITE_SENTRY_DSN")
  sentryDsn = "";

  /** VAPID public key for Web Push; empty disables push. The private half is a runway secret. */
  @Env("VITE_WEB_PUSH_VAPID_PUBLIC_KEY")
  vapidPublicKey = "";

  /** PostHog project key for flags and analytics; empty keeps both on their local drivers. */
  @Env("VITE_POSTHOG_KEY")
  posthogKey = "";
}
