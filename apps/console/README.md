# @acme/console

The web, PWA and desktop console of a Stackra project, from one source tree (ADR 0249). Every thing
with identity is a kind class whose base names its kind and whose path names its group (ADR 0294):
panels, routes and layouts, menus, shortcuts, stores, blocks, documents and config. React components
stay functions, bound to their route or block by file name. Resources, widgets, documents,
navigation and settings pages arrive from the services' manifests through `#stackra/*`; the app adds
a handful of routes, menus and shortcuts. The session, tenant, query, realtime, flags and platform
contexts are the packages', mounted from their config classes, and the desktop bridges are the
packages' too. The runtime (the entries, Vite, React Router 7, the service worker, the Electron
shell, Playwright) is generated into `.stackra/`.

| Command                    | Does                                                                                           |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| `pnpm gen`                 | `stackra gen`: rewrites `.stackra/` from the config, the runway, the kind classes, manifests   |
| `pnpm dev` / `dev:desktop` | Vite on the port of `runway.yaml` with HMR on `#stackra/*`; the desktop variant opens Electron |
| `pnpm build`               | `stackra build --target web\|pwa\|desktop` (all enabled targets by default)                    |
| `pnpm test` / `test:e2e`   | vitest (jsdom) / Playwright with axe after `build`                                             |
| `pnpm typecheck`           | gen, then tsc over `src` and `.stackra`, plus the desktop main and service-worker programs     |

## Tree

```text
apps/console
├── stackra.config.ts        defineApp: name, targets, ApiArea, env class, pwa manifest keys, electron installers, e2e
├── runway.yaml              dev port/host, domains, vars per environment, PWA/Electron channels, health (where it RUNS)
├── stackra.manifest.json    the committed contract: routes, panels, shortcuts, stores, blocks, consumes, config keys
├── package.json             aliases: #src/*, #assets/*, #stackra/* (gen) and #stackra-desktop/* (the generated Electron files)
├── .stackra/                GENERATED (see .stackra/README.md); the entries live in .stackra/entry/
└── src/
    ├── console.module.ts    the root module: `extends Module`, nothing listed
    ├── app.error.tsx        the root error boundary of both layouts
    ├── panels/              tenant-admin (/, admin area), customer-portal (/portal, app area)
    ├── config/              one class per fact: env and telemetry are the console's own; i18n, theming, pwa, desktop,
    │                        csp, query, state, identity, feature-flags, analytics, consent, peripherals override a
    │                        package's config
    ├── routes/<name>/       <name>.route.ts or <name>.layout.ts, <name>.tsx bound by name, its own hook, __tests__/:
    │                        dashboard, quick-order, settings, welcome, sign-in, open, not-found; the shell and public
    │                        layouts; `open` turns a PWA protocol link or a desktop deep link into an in-app path
    ├── components/<name>/   one component per folder (its Props, its own hook, its `__tests__/`): connection-indicator,
    │                        notification-inbox, pending-changes, pending-changes-list, palette, offline-banner,
    │                        tenant-switcher, empty-view, error-state, …
    ├── shortcuts/           Shortcut classes the palette, the keyboard and the menus share
    ├── stores/              Store classes: ui (persisted), palette
    ├── menus/               app and tray (desktop only, by their kind; a PWA has no OS menu bar)
    ├── enums/               app-local enums: density
    ├── schemas/             shape classes shared by two files: quick-order-form (derived), device-prefs, tenant-settings,
    │                        the nested telemetry config objects, the welcome hero's call to action
    ├── blocks/<name>/       one folder per page-builder block (<name>.block.ts, <name>.tsx, __tests__/): welcome-hero
    ├── documents/           Document classes: welcome
    └── styles/app.css       Tailwind v4 + HeroUI v3 + the generated brand tokens
```

A new console does not need all of this on day one: `pnpm new app --targets web` scaffolds only the
`env`, `identity` and `i18n` config classes; the desktop, PWA, peripherals, analytics and theming
classes and the menus appear when their target or feature is added.

## The two rules every file follows

1. A class's base names its kind and its options are the static declaration gen reads from the
   syntax tree (path, layout, title, tab, flag, document, keys, persist, kind, area); its members
   are behaviour (`loader`, `submit`, `meta`, `run`, store methods, `items`). Dependencies arrive
   through the constructor, typed by class; the app's `src` uses no container API. Keys, labels and
   permissions that a name already gives are derived, never written.
2. Identities are never strings outside their declaration site: permissions, queries, actions,
   events, widgets, i18n keys, settings keys, slots, panels, flags and assets are the generated
   constants of `#stackra/*`; routes are referenced by `Routes.<key>` (a layout, menu, page or
   document never imports a route class); shortcuts and blocks are referenced by class; closed value
   sets are `Enum.of` values. Each keyboard shortcut has one owner, its Shortcut class, and every
   key hint is drawn by the shortcuts package with the platform's modifier.

Config is read with `useConfig(X)` in components and hooks and through the constructor in route,
shortcut and menu classes; never as a static.

## Which file owns which fact

| Fact                                                        | File                                                  | Consumed by                                                                           |
| ----------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Name, targets, area, env class, manifest keys, installers   | `stackra.config.ts`                                   | every generated file                                                                  |
| Dev port and host, domains, public values, channels, health | `runway.yaml`                                         | `vite.config.ts`, `playwright.config.ts`, `entry/electron.ts`, `electron-builder.yml` |
| The env contract (`VITE_*`)                                 | `src/config/env.config.ts`                            | `gen/env.ts`, `env.d.ts`                                                              |
| Locales, default, RTL, fallbacks, numerals                  | `src/config/i18n.config.ts`                           | `gen/i18n.ts`, `chromium-rtl`, `index.html`, manifest, menus                          |
| The logo, schemes, theme colours                            | `src/config/theming.config.ts`                        | icons, `index.html`, the theme toggle                                                 |
| Protocol handler, caching, offline, push, updates, install  | `src/config/pwa.config.ts`                            | `pwa/manifest.<locale>.webmanifest`, `sw.ts`, the `/open` route                       |
| Mode, windows, overlays, menus, tray, deep links, updates   | `src/config/desktop.config.ts`                        | `entry/electron.ts`, `electron-builder.yml`, the `/open` route, AppMenu               |
| CSP additions                                               | `src/config/csp.config.ts`                            | the Electron main, the web targets' headers                                           |
| Cache scope and age, queue replay and leader                | `src/config/query.config.ts`                          | the query context, `gen/wiring.ts`                                                    |
| Analytics driver and consent                                | `src/config/analytics.config.ts`, `consent.config.ts` | `gen/wiring.ts`, the settings page's privacy tab                                      |
| Panels                                                      | `src/panels/`                                         | `gen/panels.ts` in every member, `routes.tsx`                                         |
| Screens                                                     | `src/routes/<name>/`                                  | `.stackra/routes.tsx`, `gen/routes.ts`                                                |
| Default documents                                           | `src/documents/*.document.ts`                         | the `document:` routes; a published tenant document wins                              |

## Tests

| File                                                  | Tier | Entry                           | Proves                                                                       |
| ----------------------------------------------------- | ---- | ------------------------------- | ---------------------------------------------------------------------------- |
| `src/__tests__/console.module.test.ts`                | unit | `@stackra/container/testing`    | the root boots on the generated wiring; panels; contexts in graph order      |
| `src/__tests__/app.error.test.tsx`                    | unit | `renderErrorBoundary`           | a 404 without retry, any other error with one                                |
| `components/**/__tests__/*.test.tsx`                  | unit | `@stackra/testing/react`        | every component in `en` and `ar`: refusals, paging, the tenant queue rule    |
| `stores/__tests__/`, `shortcuts/__tests__/`           | unit | `mountStore`, `runShortcut`     | density and the sidebar; one test per shortcut                               |
| `schemas/__tests__/`, `blocks/*/__tests__/`           | unit | `validate`, `@stackra/testing`  | the derived form and `toInput`; a block's route-key check                    |
| `routes/*/__tests__/*.route.test.ts(x)`, `*.test.tsx` | unit | `renderRoute`, `runRouteLoader` | loaders, submits, the shell's session check, documents, flag gating, `/open` |
| `routes/*/__tests__/*.e2e.test.ts`                    | e2e  | `@stackra/testing/e2e`          | shell, resources (upload), palette, offline (pwa), desktop; axe everywhere   |

## Catalog entries this member needs (root `pnpm-workspace.yaml`)

Runtime dependencies:
`@stackra/{actions,analytics,app,assets,clients,config,consent,container,contracts,coordinator,csp,errors,experience,feature-flags,filesystem,i18n,iam,identity,media,navigation,panel,peripherals,platform,query,realtime,settings,shortcuts,state,storage,tenancy,theming,ui,validation}`
and `@stackra-pro/ui` (HeroUI Pro, ADR 0113) in `catalog:stackra` (`@acme/brand` and
`@acme/loyalty-kit`, whose react entry ships the renderers of its two Custom widgets, are workspace
packages); `react`, `react-dom`, `react-router` and `zod` (the generated schemas import it) in the
default catalog; `@heroui/styles` in `catalog:ui`; `tailwindcss` and `workbox-*` in
`catalog:frontend`.

Development dependencies: `@stackra/{cli,runway,testing,vite-plugin}` in `catalog:stackra`; the
workspace presets `@stackra/{typescript,vitest}-config`; `@types/{node,react,react-dom}` in the
default catalog; `electron`, `typescript` and `vite` in `catalog:build`; `@playwright/test`,
`jsdom`, `oxfmt`, `oxlint` and `vitest` in `catalog:quality`. electron-builder is a dependency of
`@stackra/platform`, which runs it for `stackra build --target desktop`.
