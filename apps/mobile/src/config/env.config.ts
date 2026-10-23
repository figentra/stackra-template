/**
 * Stackra file contract:
 * Purpose: the env contract of the mobile app, named by `stackra.config.ts` `env`: the public
 *          values the app itself and its generated code read (the EAS project for the update URL,
 *          the gateway origin the generated clients call, the web origin of universal links).
 *          Values per environment come from runway.yaml `environments.<env>.vars`; gen inlines the
 *          dev values into the Expo config and runway syncs the others into the EAS environment of
 *          each profile. Never a `.env`, never the EAS dashboard by hand.
 * Boundary: a new config class (key `mobile.env`): the property types are the rules, the
 *           initializers the defaults, and gen compiles them to the schema. Only `EXPO_PUBLIC_`
 *           names: a server (`STACKRA_`) or credential name is a gen error on a mobile target, so
 *           nothing private can reach the binary. A value a package reads (the realtime origin,
 *           the ZITADEL issuer and client, the Sentry DSN, the PostHog key, the push transport) is
 *           bound on that package's override in this folder instead. `!:` marks a value every
 *           environment must set; `stackra validate` fails on a missing one, not the app at boot.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 4 and 19), ADR 0295 (decisions 2 and 4), ADR 0231,
 *                     ADR 0173
 */
import { Config, Env } from "@stackra/config";
import type { Url } from "@stackra/contracts";

/** The public env. Components read it with `useConfig(MobileEnvConfig)`, never `process.env`. */
export class MobileEnvConfig extends Config {
  /** EAS project id; the generated Expo config builds the update URL from it. Empty in a clone. */
  @Env("EXPO_PUBLIC_EAS_PROJECT_ID")
  easProjectId = "";

  /** Origin of the generated gateway the clients call. */
  @Env("EXPO_PUBLIC_API_ORIGIN")
  apiOrigin!: Url;

  /** Web origin of universal links (`<origin>/m/...`); its member hosts the association files. */
  @Env("EXPO_PUBLIC_APP_ORIGIN")
  appOrigin!: Url;
}
