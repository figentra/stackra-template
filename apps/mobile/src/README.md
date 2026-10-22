# src

| Folder / file         | Owns                                                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `mobile.app.ts`       | the `@App` root: the theme, the provider stack in mount order, the root layout, the panel; its header lists the provider folders           |
| `config/`             | one `@Config` class per fact: env, i18n, theming, identity, query, state, telemetry, push, release, realtime, analytics, consent, flags    |
| `enums/`              | class enums only this app uses (`ConsentCategory`)                                                                                         |
| `errors/`             | `AppError` subclasses this app raises (`SessionRequiredError`)                                                                             |
| `analytics/`          | `@AnalyticsEvent` classes (`BarcodeScanned`)                                                                                               |
| `menus/`              | `@Menu` classes: the order card's context menu                                                                                             |
| `routes/`             | `@Route` classes (`*.route.ts`) and `@Layout` classes (`*.layout.ts`); `__tests__/` holds loader/guard tests and the Maestro `*.flow.yaml` |
| `components/ui/`      | shared presentational components, folder shape of ADR 0128 d2                                                                              |
| `components/pages/`   | one page-level component per route, with its own `use-<name>.ts` hook and `__tests__/`                                                     |
| `blocks/`             | `@Block` classes with their components (the promo banner)                                                                                  |
| `documents/`          | `@Document` defaults for L2 documents (was `pages/`)                                                                                       |
| `providers/`          | one folder per provider: `<name>.provider.ts` (only when it runs code before mount), `<name>.context.tsx`, at most one hook                |
| `stores/`             | `@Store` classes on `@stackra/state`, persisted through `@stackra/storage`                                                                 |
| `schemas/`            | `Schema(z)` classes: route params, the form, the block props                                                                               |
| `overrides/<module>/` | `@Override` classes that change another module's components (its strings: `assets/overrides/<namespace>/`)                                 |
| `assets/`             | `lang/<locale>/mobile.json`, `public/logo.svg`                                                                                             |
| `styles/global.css`   | the one stylesheet entry                                                                                                                   |
| `__tests__/`          | the app root boot test                                                                                                                     |

No `features/` (a feature is a module or a page component), no `screens/`, `layouts/` or `pages/`
(routes, routes and documents), no `hooks/` yet (it appears with the first hook two components
share; today every hook has one owner and sits beside it). `menus/` holds context menus only: a
phone has no application menu. No entry, no navigator, no linking, no Expo config here: `.stackra/`
holds them, generated from `stackra.config.ts`, `runway.yaml`, `config/` and the decorated classes.
