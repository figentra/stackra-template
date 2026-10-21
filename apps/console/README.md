# @figentra/console

The web, PWA and desktop console of a Stackra project, from one source tree (ADR 0249). Every thing with identity is
a decorated class (`@App`, `@Panel`, `@Route`, `@Layout`, `@Provider`, `@Store`, `@Menu`, `@Command`, `@Bridge`,
`@Block`, `@Document`, `@Override`, `@Config`); React components stay functions referenced from decorator options.
Resources, widgets, documents, navigation and settings pages arrive from the services' manifests through
`#stackra/*`; the app adds a handful of routes, providers, menus and the desktop bridges. The runtime (Vite, React
Router 7, the service worker, the Electron shell, Playwright) is generated into `.stackra/`.

| Command                    | Does                                                                                           |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| `pnpm gen`                 | `stackra gen`: rewrites `.stackra/` from the config, the runway, the classes and the manifests |
| `pnpm dev` / `dev:desktop` | Vite on the port of `runway.yaml` with HMR on `#stackra/*`; the desktop variant opens Electron |
| `pnpm build`               | `stackra build --target web\|pwa\|desktop` (all enabled targets by default)                    |
| `pnpm test` / `test:e2e`   | vitest (jsdom; node under `src/bridges`) / Playwright with axe after `build`                   |
| `pnpm typecheck`           | gen, then tsc over `src`, `.stackra`                                                           |

## Tree

```
apps/console
├── stackra.config.ts        defineApp: key, root class, Target cases, ApiArea, env class, e2e, health (what it IS)
├── runway.yaml              dev port/host, domains, vars per environment, secret names, PWA/Electron channels (where it RUNS)
├── package.json             aliases: #src/*, #assets/*, #stackra/* (gen) and #stackra-desktop/* (the generated Electron files)
├── .stackra/                GENERATED (see .stackra/README.md); app-manifest.json committed
└── src/
    ├── console.app.ts       @App: panels and provider order
    ├── panels/              @Panel classes: tenant-admin (/), customer-portal (/portal)
    ├── config/              one @Config class per fact: env, i18n, theming, pwa, desktop, csp, query, state, telemetry,
    │                        identity, feature-flags, analytics, consent, peripherals
    ├── routes/              @Route classes (dashboard, quick-order, settings, welcome, sign-in, not-found), @Layout classes
    ├── components/
    │   ├── pages/<name>/    page components typed RouteComponent<typeof XRoute>, with their own hook
    │   └── <name>/          shell (+ connection indicator), notification-inbox, command-palette, empty/error/loading states, …
    ├── hooks/               hooks shared by two folders: use-online-status
    ├── providers/<name>/    <name>.provider.ts (only with hydrate), <name>.context.tsx, use-<name>.ts:
    │                        session, tenant, tenant-query, realtime, flags
    ├── stores/              @Store classes: ui (persisted), command-palette
    ├── enums/               app-local class enums: density
    ├── menus/               @Menu classes: app (desktop, pwa), tray and context (desktop)
    ├── commands/            @Command classes the palette, shortcuts and menus share
    ├── bridges/             @Bridge classes (Electron main): print-receipt, pick-export-folder
    ├── schemas/             one schema class per file: quick-order-form (derived), device-prefs, tenant-settings, …
    ├── blocks/              one folder per page-builder block (<name>.block.ts, <name>.tsx, index.ts, __tests__/): welcome-hero
    ├── documents/           @Document classes (L2): welcome
    ├── overrides/orders/    @Override classes: order-status-badge, revenue-sparkline
    └── styles/app.css       Tailwind v4 + HeroUI v3 + the generated brand tokens
```

A new console does not need all of this on day one: `pnpm new app --targets web` scaffolds only the `env`,
`identity` and `i18n` config classes; the desktop, PWA, peripherals, analytics and theming classes, the menus and the
bridges appear when their target or feature is added.

## The two rules every file follows

1. Decorator options are the static declaration gen reads from the AST (path, layout, prefetch, submits, document,
   component, targets, meta, cache); the class body is behaviour (`loader`, `submit`, `guard`, `hydrate`, `run`,
   `handle`, store methods). A component is always an option, never a body member.
2. Identities are never strings outside their declaration site: permissions, queries, actions, events, override points,
   widgets, i18n keys, settings keys, slots, panels, flags and assets are the generated constants of `#stackra/*`;
   routes, commands, providers and blocks are referenced by class; closed value sets are class enums.

Config is read with `useConfig(X)` in components and hooks and with `ctx.config(X)` in route, command and menu code;
never as a static.

## Which file owns which fact

| Fact                                                              | File                                                  | Consumed by                                                                         |
| ----------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------- |
| What the app is: key, targets, area, env class, e2e, health       | `stackra.config.ts`                                   | every generated file                                                                |
| Dev port and host, domains, public values, secret names, channels | `runway.yaml`                                         | `vite.config.ts`, `playwright.config.ts`, `desktop/main.ts`, `electron-builder.yml` |
| The env contract (`VITE_*`)                                       | `src/config/env.config.ts`                            | `gen/env.ts`, `env.d.ts`                                                            |
| Locales, default, RTL, fallbacks, numerals                        | `src/config/i18n.config.ts`                           | `gen/i18n.ts`, `chromium-rtl`, `index.html`, manifest, menus                        |
| The logo, schemes, theme colours                                  | `src/config/theming.config.ts`                        | icons, `index.html`, the theme toggle                                               |
| Worker build, manifest fields, caching, offline, push, updates    | `src/config/pwa.config.ts`                            | `pwa/manifest.webmanifest`, `pwa/offline.html`, `sw.ts`, `vite.config.ts`           |
| Windows, menus, tray, deep links, updates, packaging              | `src/config/desktop.config.ts`                        | `desktop/main.ts`, `electron-builder.yml`                                           |
| CSP additions                                                     | `src/config/csp.config.ts`                            | `desktop/main.ts`, the web targets' headers                                         |
| Cache scope and age, queue replay and leader                      | `src/config/query.config.ts`                          | `providers/tenant-query`, `gen/wiring.ts`                                           |
| Analytics driver and consent                                      | `src/config/analytics.config.ts`, `consent.config.ts` | `gen/wiring.ts`, the settings page's privacy tab                                    |
| Panels, provider order                                            | `src/console.app.ts`, `src/panels/`                   | `gen/panels.ts` in every member, `gen/wiring.ts`, `createApp`                       |
| Screens                                                           | `src/routes/*.route.ts` + `*.layout.ts`               | `.stackra/routes.tsx`, `gen/routes.ts`                                              |
| Main-process behaviour                                            | `src/bridges/*.bridge.ts` + `schemas/`                | `desktop/preload.ts`, `bridge-client.ts`, `handlers.ts`                             |
| Shadowed module points                                            | `src/overrides/<module>/`                             | `gen/overrides.ts`                                                                  |
| Default L2 documents                                              | `src/documents/*.document.ts`                         | the `document:` routes; a published tenant document wins                            |

## Tests

| File                                          | Tier | Entry                            | Proves                                                                     |
| --------------------------------------------- | ---- | -------------------------------- | -------------------------------------------------------------------------- |
| `src/__tests__/console.app.test.ts`           | unit | `@stackra/container/testing`     | the root boots on the generated wiring; panels; overrides covered          |
| `components/**/__tests__/*.test.tsx`          | unit | `@stackra/testing/react`         | `en` and `ar` (RTL), typed refusals, inbox, realtime indicator             |
| `providers/*/__tests__/`, `stores/__tests__/` | unit | `hydrateProvider`, `mountStore`  | remembered tenant and the queue rule; realtime connect; density            |
| `schemas/__tests__/`, `commands/__tests__/`   | unit | `@stackra/testing`, `runCommand` | the derived form and `toInput`; one test per command                       |
| `routes/__tests__/*.route.test.tsx`           | unit | `renderRoute`, `runRouteLoader`  | prefetch, submits, submit, guard, document fallback, flag gating           |
| `bridges/__tests__/`                          | unit | `runBridge`                      | each bridge with its fake port; the handler refusing bad calls             |
| `routes/__tests__/*.e2e.test.ts`              | e2e  | `@stackra/testing/e2e`           | shell, resources (upload), palette, offline (pwa), desktop; axe everywhere |

## Catalog entries this member needs (root `pnpm-workspace.yaml`)

`@stackra/{analytics,app,assets,clients,config,consent,container,contracts,coordinator,errors,experience,feature-flags,filesystem,i18n,iam,identity,kbd,media,navigation,panel,peripherals,platform,query,realtime,schema,settings,state,storage,tenancy,theming,ui,validation}`
and `@stackra-pro/ui` (HeroUI Pro, ADR 0113) in `catalog:stackra`; `@heroui/styles` in `catalog:ui`; `workbox-*` in `catalog:frontend`.
