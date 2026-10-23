# src/config

One fact, one file. Each file is one config class (ADR 0294 decision 19): the property types are the
rules, the initializers the defaults, and gen compiles them to the schema, so no Zod is written
here. Two forms:

- **An override** of a package's config class, `Mobile<Base> extends <Base>`: `override` members
  only, no new field, the base's key inherited. Its presence also mounts the package's context in
  the generated entry (ADR 0295 decision 10), so the app writes no provider for it. A nested object
  is replaced whole, so an override merges the base value (`{ ...this.errors, sampleRate: 1 }`); a
  field typed by an enum or a driver name restates its type.
- **A new class**, `extends Config`, keyed `mobile.<stem>`: only `MobileEnv`.

`@Env("EXPO_PUBLIC_*")` binds a field to a public variable, the only prefix gen accepts on a mobile
target. Layers, lowest first: package defaults, these classes, the environment (`@Env`), then
runway.yaml `environments.<env>.config`. Validated at gen and at boot, frozen, injected by type:
components read a class with `useConfig(X)`. Nothing here is a secret (a native client has none),
nothing here is code (a driver class is bound with `@Replaces`), and nothing here is a port, a
domain, a channel or a profile (those are runway.yaml).

| File                      | Class                      | Key                 | The fact                                                                     | Gen also reads it for                                                                               |
| ------------------------- | -------------------------- | ------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `env.config.ts`           | `MobileEnv`                | `mobile.env`        | the env contract named by `stackra.config.ts`: EAS project, API, app origin  | `gen/env.ts`, `env.d.ts`, the `vars` check of runway.yaml, `eas-sync.json`, the update URL, linking |
| `chrome.config.ts`        | `MobileChromeConfig`       | `navigation.chrome` | the header and the tab bar                                                   | `gen/navigation.tsx` screen options, the Expo configuration's start values                          |
| `i18n.config.ts`          | `MobileI18nConfig`         | `i18n`              | locales, default, RTL set, fallbacks, numerals                               | `#stackra/i18n` loaders, the RTL switch, one Maestro run per locale, `CFBundleLocalizations`        |
| `theming.config.ts`       | `MobileThemingConfig`      | `theming`           | brand package, the one logo source, schemes, theme and splash colours        | icons and splash in the Expo configuration                                                          |
| `identity.config.ts`      | `MobileIdentityConfig`     | `identity`          | ZITADEL issuer and client, PKCE redirect path, scopes, idle rule             | the redirect URI, the linking filter                                                                |
| `query.config.ts`         | `MobileQueryConfig`        | `query`             | cache age, queue replay, retention, stale time                               | the storage drivers in `gen/wiring.ts`                                                              |
| `state.config.ts`         | `MobileStateConfig`        | `state`             | where persisted stores go, hydration                                         | the splash rule of the entry                                                                        |
| `telemetry.config.ts`     | `MobileTelemetryConfig`    | `logger.telemetry`  | Sentry DSN, error reporting, sampling, native crashes, the cold-start budget | the Sentry Metro and Expo plugins (project from runway.yaml)                                        |
| `push.config.ts`          | `MobilePushConfig`         | `platform.push`     | transport, foreground rule, channels, ask timing                             | the `expo-notifications` plugin                                                                     |
| `realtime.config.ts`      | `MobileRealtimeConfig`     | `realtime`          | origin, foreground reconnect, background grace, backoff cap                  | —                                                                                                   |
| `analytics.config.ts`     | `MobileAnalyticsConfig`    | `analytics`         | driver, key, gating consent category, screen autocapture, denied properties  | the analytics driver in `gen/wiring.ts`, the privacy manifest                                       |
| `consent.config.ts`       | `MobileConsentConfig`      | `consent`           | categories, policy version, first-launch prompt                              | —                                                                                                   |
| `feature-flags.config.ts` | `MobileFeatureFlagsConfig` | `feature_flags`     | flag provider, key, build-time values, refresh                               | the flag provider in `gen/wiring.ts`                                                                |

What the app _is_ (name, scheme, bundle identifiers, orientation, runtime policy) is not a config
class: build tools are its only readers, so it lives in `stackra.config.ts` (ADR 0295 decision 4).
Add a fact: `pnpm new config <fact>` writes `<fact>.config.ts`; gen fails on a config class nothing
reads and on an `@Env` name without the public prefix.
