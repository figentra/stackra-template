/**
 * Stackra file contract:
 * Purpose: the env CONTRACT of the mobile app, referenced by `stackra.config.ts` `env`. Every field
 *          is `@Env` with the `EXPO_PUBLIC_` prefix: the only values Expo inlines into the bundle.
 *          VALUES per environment come from `runway.yaml` `environments.<env>.vars` (gen inlines
 *          them into `.stackra/app.config.ts` and runway syncs them into the EAS environment of
 *          each profile); never a `.env`, never the EAS dashboard by hand.
 * Boundary: public values only; a server (`STACKRA_`) or secret name here is a gen error on a
 *           mobile target. `!:` marks a value every environment must set; `stackra validate` fails
 *           on a missing one, not the app at boot.
 * Runtime: react-native
 * Governing contract: ADR 0231, ADR 0173
 */
import { Config, Env } from "@stackra/config";
import { Str, Url } from "@stackra/validation";

/** The public env. Components read it with `useConfig(MobileEnv)`, never through `process.env`. */
@Config("mobile.env")
export class MobileEnv {
  /**
   * EAS project id (public); the generated Expo config builds the update URL from it. Empty in a
   * bare clone.
   */
  @Env("EXPO_PUBLIC_EAS_PROJECT_ID") @Str({ allowEmpty: true }) easProjectId = "";
  /** Origin of the generated gateway the clients call. */
  @Env("EXPO_PUBLIC_API_ORIGIN") @Url() apiOrigin!: string;
  /** Web origin for universal links (`<origin>/m/...`) and the post-logout redirect. */
  @Env("EXPO_PUBLIC_APP_ORIGIN") @Url() appOrigin!: string;
  /**
   * Origin of the realtime gateway (`ws:` or `wss:`); the realtime provider connects to it after
   * sign-in.
   */
  @Env("EXPO_PUBLIC_REALTIME_ORIGIN") @Url({ protocols: ["ws", "wss"] }) realtimeOrigin!: string;
  /** ZITADEL issuer; the PKCE flow discovers endpoints from it. */
  @Env("EXPO_PUBLIC_ZITADEL_ISSUER") @Url() zitadelIssuer!: string;
  /** ZITADEL native-app client id (public client, PKCE, no secret). */
  @Env("EXPO_PUBLIC_ZITADEL_CLIENT_ID") @Str() zitadelClientId!: string;
  /** Sentry DSN; empty disables crash reporting. Public by design. */
  @Env("EXPO_PUBLIC_SENTRY_DSN") @Str({ allowEmpty: true }) sentryDsn = "";
}
