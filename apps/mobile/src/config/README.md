# src/config

One fact, one file. Each file is one config class (ADR 0294 decision 19): the property types are the
rules, the initializers the defaults, and gen compiles them to the schema, so no Zod is written
here. Two forms:

- **An override** of a package's config class, named like its base, which is imported under a `Base`
  alias (`import { QueryConfig as BaseQueryConfig } …; class QueryConfig extends BaseQueryConfig`):
  `override` members only, no new field, no `schema` or `env`, the base's key inherited; gen refuses
  a second override of one base. Its presence also mounts the package's context in the generated
  entry (ADR 0295 decision 10), so the app writes no provider for it. A nested object is replaced
  whole, so an override merges the base value (`{ ...this.errors, sampleRate: 1 }`); a field typed
  by an enum or a driver name restates its type.
- **A new class**, `extends Config({ schema, env })`, keyed `mobile.<stem>`: only `EnvConfig`, whose
  shape is `schemas/env-options.schema.ts` (`EnvOptions`).

`EnvConfig`'s `env` map binds each field to a public variable, the only prefix gen accepts on a
mobile target; a field named after a package's config field (`identityIssuer`) feeds that field, so
no override reads the environment. Layers, lowest first: package defaults, these classes, the
environment (`EnvConfig`), then runway.yaml `environments.<env>.config`. Validated at gen and at
boot, frozen, injected by type: components read a class with `useConfig(X)`. Nothing here is a
secret (a native client has none), nothing here is code (a driver class is bound with `@Replaces`),
and nothing here is a port, a domain, a channel or a profile (those are runway.yaml).

| File                      | Class                | Key                 | The fact                                                                     | Gen also reads it for                                                                               |
| ------------------------- | -------------------- | ------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `env.config.ts`           | `EnvConfig`          | `mobile.env`        | the env contract named by `stackra.config.ts`: every public value            | `gen/env.ts`, `env.d.ts`, the `vars` check of runway.yaml, `eas-sync.json`, the update URL, linking |
| `chrome.config.ts`        | `ChromeConfig`       | `navigation.chrome` | the header and the tab bar                                                   | `gen/navigation.tsx` screen options, the Expo configuration's start values                          |
| `i18n.config.ts`          | `MobileI18nConfig`   | `i18n`              | locales with `en-US` and `ar-SA` overlays, RTL set, fallback chain, numerals | `#stackra/i18n` loaders, the RTL switch, one Maestro run per locale, `CFBundleLocalizations`        |
| `theming.config.ts`       | `ThemingConfig`      | `theming`           | the `acme` theme, the app's logo source, schemes, theme and splash colours   | icons and splash in the Expo configuration                                                          |
| `identity.config.ts`      | `IdentityConfig`     | `identity`          | PKCE redirect path, scopes, idle rule (issuer and client from `EnvConfig`)   | the redirect URI, the linking filter                                                                |
| `query.config.ts`         | `QueryConfig`        | `query`             | cache age, queue replay, retention, stale time                               | the storage drivers in `gen/wiring.ts`                                                              |
| `state.config.ts`         | `StateConfig`        | `state`             | where persisted stores go, hydration                                         | the splash rule of the entry                                                                        |
| `telemetry.config.ts`     | `TelemetryConfig`    | `logger.telemetry`  | error reporting, sampling, native crashes, the cold-start budget             | the Sentry Metro and Expo plugins (project from runway.yaml)                                        |
| `push.config.ts`          | `PushConfig`         | `platform.push`     | transport, foreground rule, channels, ask timing                             | the `expo-notifications` plugin                                                                     |
| `realtime.config.ts`      | `RealtimeConfig`     | `realtime`          | foreground reconnect, background grace, backoff cap                          | —                                                                                                   |
| `analytics.config.ts`     | `AnalyticsConfig`    | `analytics`         | driver, gating consent category, page-view (screen) capture, denied props    | the analytics driver in `gen/wiring.ts`, the privacy manifest                                       |
| `consent.config.ts`       | `ConsentConfig`      | `consent`           | categories (`{ category, required, defaultGranted }`), policy, first launch  | —                                                                                                   |
| `feature-flags.config.ts` | `FeatureFlagsConfig` | `feature_flags`     | flag provider, build-time values, refresh                                    | the flag provider in `gen/wiring.ts`                                                                |

What the app _is_ (name, scheme, bundle identifiers, orientation, runtime policy) is not a config
class: build tools are its only readers, so it lives in `stackra.config.ts` (ADR 0295 decision 4).
Add a fact: `pnpm new config <fact>` writes `<fact>.config.ts`; gen fails on a config class nothing
reads and on an `env` name without the public prefix.
