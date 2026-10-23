# src/config

One fact, one file. Each file is one config class (ADR 0294 decision 19): the property types are the
rules, the initializers the defaults, and gen compiles them to the schema, so no Zod is written
here. Two forms:

- **An override** of a package's config class, named like its base, which is imported under a `Base`
  alias (`import { SeoConfig as BaseSeoConfig } …; class SeoConfig extends BaseSeoConfig`):
  `override` members only, no new field, no `schema` or `env`, the base's key inherited; gen refuses
  a second override of one base. Its presence also mounts the package's context in the generated
  entries, so the site writes no provider for it. A nested object is replaced whole, so an override
  merges the base value (`{ ...this.errors, sampleRate: 1 }`); a field typed by an enum or a driver
  name restates its type.
- **A new class**, `extends Config({ schema, env })`, keyed `web.<stem>`, whose shape is
  `schemas/<stem>-options.schema.ts`: `EnvConfig`, `SiteConfig` and `EdgeConfig`.

`EnvConfig`'s `env` map binds each field to its variable: `VITE_` fields are public, inlined into
the browser bundle and the Worker build alike; `STACKRA_` fields are read from the Worker's `env`
per request; the two secrets are `@Secret` fields of `EnvOptions`, named, never valued. A field
named after a package's config field (`telemetryDsn`) feeds that field, so no override reads the
environment. Layers, lowest first: package defaults, these classes, the environment (`EnvConfig`),
then runway.yaml `environments.<env>.config`. Components read a class with `useConfig(X)`; route,
layout and menu classes take it through the constructor.

| File                      | Class                | Key                | The fact                                                                        |
| ------------------------- | -------------------- | ------------------ | ------------------------------------------------------------------------------- |
| `env.config.ts`           | `EnvConfig`          | `web.env`          | the env contract named by `stackra.config.ts`: public, server and secret fields |
| `site.config.ts`          | `SiteConfig`         | `web.site`         | preview hosts, an optional fixed site, the product sold, signup and docs links  |
| `edge.config.ts`          | `EdgeConfig`         | `web.edge`         | data cache windows per `CacheProfile`, redirects, the 404 log, stream timeout   |
| `i18n.config.ts`          | `I18nConfig`         | `i18n`             | locales with `en-US` and `ar-SA` overlays, fallback chains, the URL strategy    |
| `theming.config.ts`       | `ThemingConfig`      | `theming`          | the `acme` theme, the logo source, schemes, the theme colour, tenant colours    |
| `seo.config.ts`           | `SeoConfig`          | `seo`              | title template, robots groups, sitemap paging, the OG template, `noindex` rules |
| `consent.config.ts`       | `ConsentConfig`      | `consent`          | categories (`{ category, required, defaultGranted }`), cookie, policy, regions  |
| `analytics.config.ts`     | `AnalyticsConfig`    | `analytics`        | driver, gating consent category, page-view and click capture, denied properties |
| `feature-flags.config.ts` | `FeatureFlagsConfig` | `feature_flags`    | flag provider, build-time values, per-visitor targeting                         |
| `telemetry.config.ts`     | `TelemetryConfig`    | `logger.telemetry` | error reporting, sampling, vitals, bundle and Lighthouse budgets (no replay)    |
| `csp.config.ts`           | `CspConfig`          | `csp`              | Content Security Policy additions and the Report-Only rollout                   |

What the site _is_ (targets, render mode, area, e2e projects and seeds) is not a config class: build
and test tools are its only readers, so it lives in `stackra.config.ts`. Where it runs (port,
domains, vars, Worker knobs) is runway.yaml. Gen fails on a config class nothing reads and on an
`env` name without the `VITE_` or `STACKRA_` prefix.
