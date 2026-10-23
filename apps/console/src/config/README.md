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
  by an enum or a driver name restates its type. The generated wiring lists each one as
  `{ key, provide: BaseX, override: X }`.
- **A new class**, `extends Config({ schema, env })`, keyed `console.<stem>`: only `EnvConfig`,
  whose shape is `schemas/env-options.schema.ts` (`EnvOptions`).

`EnvConfig`'s `env` map binds each field to a `VITE_` variable, the only prefix gen accepts on a
browser target; a field named after a package's config field (`telemetryDsn`) feeds that field
(`telemetry.dsn`), so no override reads the environment. Layers, lowest first: package defaults,
these classes, the environment (`EnvConfig`), then runway.yaml `environments.<env>.config`.
Validated at gen and at boot, frozen, injected by type: components and hooks read a class with
`useConfig(X)`, route, shortcut and menu classes through the constructor. Nothing here is a secret
(a browser client holds none), nothing here is code (a driver class is bound with `@Replaces`), and
nothing here is a port, a domain or a channel (those are runway.yaml).

| File                      | Class                | Key                | The fact                                                                            | Gen also reads it for                                                   |
| ------------------------- | -------------------- | ------------------ | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `env.config.ts`           | `EnvConfig`          | `console.env`      | the env contract named by `stackra.config.ts`: every public value                   | `gen/env.ts`, `env.d.ts`, the `vars` check of runway.yaml               |
| `i18n.config.ts`          | `I18nConfig`         | `i18n`             | locales with `en-US` and `ar-SA` overlays, fallback chains, URL prefixes, digits    | `#stackra/i18n`, the HTML pages, manifests and offline pages per locale |
| `theming.config.ts`       | `ThemingConfig`      | `theming`          | the `acme` theme, the one logo source, schemes and fonts                            | every icon, the HTML pages, the manifests                               |
| `identity.config.ts`      | `IdentityConfig`     | `identity`         | BFF cookie session on web and PWA, PKCE on desktop, idle rule, scopes               | the session driver per target in `gen/wiring.ts`                        |
| `query.config.ts`         | `QueryConfig`        | `query`            | cache scope and age, the offline queue's replay and leader                          | the persister and leader drivers in `gen/wiring.ts`                     |
| `state.config.ts`         | `StateConfig`        | `state`            | where persisted stores go, hydration, devtools                                      | —                                                                       |
| `telemetry.config.ts`     | `TelemetryConfig`    | `logger.telemetry` | error reporting, traces, consent-gated replay, web vitals, field and bundle budgets | the bundle budgets and source-map upload in `vite.config.ts`            |
| `analytics.config.ts`     | `AnalyticsConfig`    | `analytics`        | driver, gating consent category, page-view and click capture, denied properties     | the analytics driver in `gen/wiring.ts`                                 |
| `consent.config.ts`       | `ConsentConfig`      | `consent`          | the categories asked in settings, the policy version                                | the settings page's privacy tab                                         |
| `feature-flags.config.ts` | `FeatureFlagsConfig` | `feature_flags`    | flag provider, build-time values, refresh, targeting                                | the flag provider in `gen/wiring.ts`                                    |
| `pwa.config.ts`           | `PwaConfig`          | `platform.pwa`     | handlers, caching preset, offline, push, updates, install prompt                    | `pwa/manifest.<locale>.webmanifest`, `sw.ts`                            |
| `desktop.config.ts`       | `DesktopConfig`      | `platform.desktop` | mode, windows, overlays, menus, tray, deep links, devices                           | `entry/electron.ts`, `electron-builder.yml`, `entitlements.mac.plist`   |
| `csp.config.ts`           | `CspConfig`          | `csp`              | Content Security Policy additions                                                   | the Electron main's `app://` header, the web targets' headers           |
| `peripherals.config.ts`   | `PeripheralsConfig`  | `peripherals`      | the point-of-sale printer, cash drawer and scanner, each a driver by name           | the main-process drivers in `desktop/wiring.ts`                         |

What the app _is_ (name, targets, area, the manifest keys, installers) is not a config class: build
tools are its only readers, so it lives in `stackra.config.ts` (ADR 0295 decision 4). Add a fact:
`pnpm new config <fact>` writes `<fact>.config.ts`; gen fails on a config class nothing reads and on
an `env` name without the `VITE_` prefix.
