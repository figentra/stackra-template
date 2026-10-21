# src/config

One fact, one file. Each file is one `@Config("mobile.<fact>")` class: types come from the property
declarations, validation from the field decorators of `@stackra/validation`, Zod is the engine and
never visible. `@Env("EXPO_PUBLIC_*")` binds a field to a public variable (the only prefix gen
accepts on a mobile target). Layers, lowest first: package defaults → these classes → the
environment (`@Env`) → `runway.yaml` `environments.<env>.config`. Validated at gen and at boot,
frozen, injected by type: components read a class with `useConfig(X)`, providers and other code
outside React with `ctx.config(X)`. Closed sets are class enums (`ColorScheme`, `QueryScope`,
`StorageArea`, `PromptMoment`, `NumberingSystem`, `ConsentCategory`); a driver choice is a
`DriverName<Port>` literal on a `@DriverOf` field; a tool-owned value says so in its docblock.
Nothing here is a secret (a native client has none), nothing here is code (a driver class goes
through `@Replaces`), nothing here is a port, a domain, a channel or a profile (those are
`runway.yaml`), and no field holds a generated descriptor.

| File                      | The fact                                                                            | Gen reads it for                                                                                          |
| ------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `env.config.ts`           | the public env contract (`MobileEnv`), referenced by `stackra.config.ts`            | `gen/env.ts`, `env.d.ts`, the `vars` check of `runway.yaml`, `eas-sync.json`                              |
| `i18n.config.ts`          | locales, default, RTL set, fallbacks, numerals                                      | `#stackra/i18n` loaders, the RTL switch in the entry, one Maestro run per locale, `CFBundleLocalizations` |
| `theming.config.ts`       | brand package, the one logo source, schemes, theme and splash colours, Liquid Glass | icons and splash in `app.config.ts`, header presets in `gen/navigation.tsx`, the theme provider           |
| `identity.config.ts`      | PKCE redirect path, scopes, idle rule                                               | the redirect URI, the linking filter, the identity module's wiring                                        |
| `query.config.ts`         | cache age, queue replay, retention, stale time                                      | the query provider and the storage drivers in `gen/wiring.ts`                                             |
| `state.config.ts`         | where `@Store({ persist })` state goes, hydration, devtools                         | the state module's wiring, the splash rule in `main.ts`                                                   |
| `telemetry.config.ts`     | error reporting, sampling, native crashes, the cold-start budget                    | the reporter bootstrap in `main.ts`, the Sentry plugin (project from `runway.yaml`)                       |
| `push.config.ts`          | transport, foreground rule, channels, ask timing                                    | the `expo-notifications` plugin, the push provider                                                        |
| `release.config.ts`       | name, slug, scheme, store identifiers, runtime policy, min version                  | `app.config.ts` ids and `runtimeVersion`; profiles and channels come from `runway.yaml`                   |
| `realtime.config.ts`      | foreground reconnect, background grace, backoff cap                                 | the realtime provider and its context                                                                     |
| `analytics.config.ts`     | driver, gating consent category, screen autocapture, denied properties              | the analytics module's wiring; `analytics.track(...)` in the scanner                                      |
| `consent.config.ts`       | categories, policy version, first-launch prompt                                     | the settings page's consent section; analytics and telemetry replay read the decision                     |
| `feature-flags.config.ts` | flag provider, key, build-time values, refresh                                      | the flags context; `flag:` on the scan route                                                              |

Add a fact: `pnpm new config <fact>` writes `<fact>.config.ts` with the class; gen fails on a config
key nothing reads and on an `@Env` name without the public prefix (ADR 0231 d4 lint).
