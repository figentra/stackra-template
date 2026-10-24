/**
 * Stackra file contract:
 * Purpose: the env contract of the mobile app, named by `stackra.config.ts` `env`: every public
 *          value the binary carries (the EAS project for the update URL, the gateway origin the
 *          generated clients call, the console origin of universal links, and the values the
 *          packages' contexts read: the realtime origin, the identity issuer and client, the Sentry
 *          DSN, the push transport, the PostHog key). Values per environment come from runway.yaml
 *          `environments.<env>.vars`; gen inlines the dev values into the Expo config and runway
 *          syncs the others into the EAS environment of each profile. Never a `.env`, never the EAS
 *          dashboard by hand.
 * Boundary: a new config class (key `mobile.env`, derived): the shape is `EnvOptions` and `env`
 *           maps each field to its variable. Only `EXPO_PUBLIC_` names: a server (`STACKRA_`) or
 *           credential name is a gen error on a mobile target, so nothing private can reach the
 *           binary. The package overrides in this folder read no environment themselves: a field
 *           named after a package's config field (`identityIssuer`) feeds that field when
 *           `createApp` layers the env over the config defaults.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 4 and 19, as amended by programming model v3.1,
 *                     AGENTS.md), ADR 0295 (decisions 2 and 4), ADR 0231, ADR 0173
 */
import { Config } from "@stackra/config";
import { EnvOptions } from "#src/schemas/env-options.schema";

/**
 * The public env. Components read it with `useConfig(EnvConfig)`, never `process.env`.
 */
export class EnvConfig extends Config({
  schema: EnvOptions,
  env: {
    easProjectId: "EXPO_PUBLIC_EAS_PROJECT_ID",
    apiOrigin: "EXPO_PUBLIC_API_ORIGIN",
    appOrigin: "EXPO_PUBLIC_APP_ORIGIN",
    realtimeOrigin: "EXPO_PUBLIC_REALTIME_ORIGIN",
    identityIssuer: "EXPO_PUBLIC_IDENTITY_ISSUER",
    identityClientId: "EXPO_PUBLIC_IDENTITY_CLIENT_ID",
    telemetryDsn: "EXPO_PUBLIC_SENTRY_DSN",
    pushProvider: "EXPO_PUBLIC_PUSH_PROVIDER",
    analyticsPosthogKey: "EXPO_PUBLIC_POSTHOG_KEY",
    featureFlagsPosthogKey: "EXPO_PUBLIC_POSTHOG_KEY",
  },
}) {}
