# @acme/console

The web, PWA and desktop console of a Stackra project, from one source tree (ADR 0249). Every thing
with identity is a kind class whose base names its kind and whose path names its group (ADR 0294):
panels, routes and layouts, menus, shortcuts, stores, blocks, documents and config. Components,
route pages, layouts and block renderers are class components (`extends Component<Props>` from
`#stackra/ui`): fields are state, a field that calls a `use*` hook is that hook's result, methods
are plain functions, getters are derived values, `mount()` and `unmount()` are the lifecycle and
`render()` is the body. `stackra gen` compiles each one to a React function component, so React, the
React Compiler, Fast Refresh and the hooks lint only ever see functions. Resources, widgets,
documents, navigation and settings pages arrive from the services' manifests through `#stackra/*`;
the app adds a handful of routes, menus and shortcuts. The session, tenant, query, realtime, flags
and platform contexts are the packages', mounted from their config classes, and the desktop bridges
and the root error boundary are the packages' too. The runtime (the entries, Vite, React Router 7,
the service worker, the Electron shell, Playwright) is generated into `.stackra/`.

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
├── stackra.config.ts        defineApp: name, targets, ApiArea, env class, every pwa manifest key, electron installers, e2e
├── runway.yaml              dev port/host, domains, vars per environment, PWA/Electron channels, health (where it RUNS)
├── stackra.manifest.json    the committed contract: routes, panels, shortcuts, stores, blocks, overrides, consumes, config
├── package.json             aliases: #src/*, #assets/*, #stackra/* (gen) and #stackra-desktop/* (the generated Electron files)
├── assets/lang/<locale>/    one file per namespace: console, shortcuts, manifest, pages, documents, menus, enums, devices;
│                            en and ar complete, en-US and ar-SA overlays with only the keys that differ
├── .stackra/                GENERATED (see .stackra/README.md); the entries live in .stackra/entry/
└── src/                     no root module: nothing to say that gen cannot derive, so the member is one module;
    │                        src/README.md and a README in each group folder say what lives there
    ├── panels/              tenant-admin (/, admin area), customer-portal (/portal, app area)
    ├── config/              one class per fact: env (every VITE_* value) is the console's own, `Config({ schema,
    │                        env })`; i18n, theming, pwa, desktop, csp, query, state, identity, telemetry,
    │                        feature-flags, analytics, consent, peripherals override a package's (`extends BaseX`)
    ├── routes/<name>/       <name>.route.ts or <name>.layout.ts and <name>.tsx (its class page) bound by name, __tests__/:
    │                        dashboard, quick-order, settings, welcome, sign-in, open, share, open-file,
    │                        mobile-link (/m/*), offline, not-found; the shell and public layouts
    ├── components/<name>/   one class component per folder, its <name>.props.ts, its own hook, its __tests__/:
    │                        connection-indicator, notification-inbox, pending-changes, pending-changes-list, palette,
    │                        offline-banner, tenant-switcher, attach-images, image-previews, empty-view, …
    ├── hooks/               hooks with two or more importers: use-online-status, use-variant-search
    ├── types/               the result types of the console's hooks, one per file
    ├── overrides/<owner>/   shadows of code the console does not own, at the owner's own path:
    │                        @acme/loyalty-kit's PointsBalance renderer and its PointsBalanceWidget placement
    ├── shortcuts/           Shortcut classes the palette, the keyboard and the menus share
    ├── stores/              Store classes: ui (persisted), palette
    ├── menus/               app and tray (desktop only, by their kind; a PWA has no OS menu bar)
    ├── enums/               app-local enums: density, settings-tab
    ├── schemas/             shape classes: the env options, quick-order-form (derived), attach-images-form,
    │                        device-prefs, tenant-settings, the welcome hero's action
    ├── blocks/<name>/       one folder per page-builder block (<name>.block.ts, <name>.tsx, __tests__/): welcome-hero
    ├── documents/           Document classes: welcome
    └── styles/app.css       Tailwind v4, HeroUI v3, the @stackra/tokens faces and the @acme/theme `acme` theme
```

A new console does not need all of this on day one: `pnpm new app --targets web` scaffolds only the
`env`, `identity` and `i18n` config classes; the desktop, PWA, peripherals, analytics and theming
classes and the menus appear when their target or feature is added.

## The rules every file follows

1. A class's base names its kind and its options are the static declaration gen reads from the
   syntax tree (path, layout, title, tab, flag, document, keys, persist, kind, area, prerender); its
   members are behaviour (`loader`, `submit`, `meta`, `run`, store methods, `items`). Dependencies
   arrive through the constructor, typed by class; the app's `src` uses no container API. Keys,
   labels and permissions that a name already gives are derived, never written.
2. Identities are never strings outside their declaration site: consumed actions, queries, events,
   widgets, permissions, refusals and modules are named classes of `#stackra/clients/<service>`
   (`OrderKpisQuery`, `CreateOrderAction`, `OrderPaid`); i18n keys, settings keys, slots, panels,
   flags and assets are the generated constants of `#stackra/*`; routes are referenced by
   `Routes.<key>` (a layout, menu, page or document never imports a route class); shortcuts and
   blocks are referenced by class; closed value sets are `Enum.of` values; icons are `IconName`
   strings (`icon: "receipt"`). Each keyboard shortcut has one owner, its Shortcut class, and every
   key hint is drawn by the shortcuts package with the platform's modifier.
3. One exported declaration per file: a component's Props live in `<name>.props.ts` beside it, a
   hook's result type in `src/types/`, a form's shape in `src/schemas/`.

Config is read with `useConfig(X)` in components and hooks and through the constructor in route,
shortcut and menu classes; never as a static. The environment is read in one place, `EnvConfig`: a
field named after a package config field feeds that field (`analyticsPosthogKey` →
`analytics.posthogKey`, `telemetryDsn` → `telemetry.dsn`), so no override reads env. Every config
override is wired as `{ key, provide: BaseX, override: X }` in `.stackra/gen/wiring.ts`.

## Locales

`src/config/i18n.config.ts` declares `en`, `ar` and the regional overlays `en-US` and `ar-SA`. A
base locale ships every namespace; an overlay folder holds only the keys that truly differ (en-US:
American spelling and revenue quoted before sales tax; ar-SA: the Saudi word for a tenant, منشأة,
and VAT-inclusive revenue). A missing key resolves along the chain (`ar-SA` → `ar` → `en`). URLs
carry the lowercase tag as a prefix except for the default (`/quick-order`, `/ar-sa/quick-order`).
The config declares, `@stackra/i18n` resolves at run time (negotiation, the chain, ICU plurals,
`lang` and `dir`), and gen checks the files and writes `#stackra/i18n`, one HTML page, one manifest
and one prerendered offline page per locale.

## PWA

Every web app manifest attribute is shown, per locale: names and description from `manifest::`,
`id`, `start_url`, `scope`, `display` with `display_override`, `orientation`, colours per scheme
from the theme, `lang` and `dir`, `categories`, icons (any, maskable 192 and 512, monochrome), wide
and narrow screenshots with labels, four shortcuts (dashboard, orders, quick order, settings), the
share target (`/share`), the file handler (`/open-file`, PNG, JPEG, WebP), the protocol handler
(`/open`), `launch_handler`, `handle_links`, `edge_side_panel` and `related_applications` with
`prefer_related_applications: false`. The service worker takes the `balanced` caching preset
(`online-first` and `offline-first` are the others) with per-route overrides in `pwa.config.ts`.
When even the cached shell is missing, the worker serves the React offline page (`routes/offline/`)
that gen prerendered for the request's locale.

## Universal links

The console's domain is the mobile app's `appOrigin`. `stackra.config.ts` `appLinks` names
`@acme/mobile` and its paths (`/m`, `/m/*`); gen writes
`.stackra/public/.well-known/apple-app-site-association` and `.well-known/assetlinks.json` from the
mobile app's bundle id and package and the root runway's `providers.apple.teamId` and
`providers.google.appSigningSha256`. Those two values are runway references (`${providers.*}`) that
the deploy step resolves into the built files; neither is ever a literal in the repository. Both
files are served as `application/json` with no redirect (`public/_headers`), and the service worker
never intercepts `/.well-known/`. A browser without the app lands on `MobileLinkRoute`
(`routes/mobile-link/`), which redirects each mobile path to the console page that shows the same
thing and shows a notice with a way to the dashboard for a screen the console does not have.

## Desktop

`desktop.config.ts` `devices` declares the point-of-sale set (camera, microphone, USB, Bluetooth,
serial), each with its reason in `devices::`. Gen derives the macOS entitlements and the
`NSCameraUsageDescription`, `NSMicrophoneUsageDescription` and `NSBluetoothAlwaysUsageDescription`
strings in English and Arabic from it; serial, notifications and Wallet need no entitlement. Every
Electron fuse is listed in `.stackra/desktop/fuses.json`.

## Which file owns which fact

| Fact                                                        | File                                                  | Consumed by                                                                              |
| ----------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Name, targets, area, env class, manifest keys, installers   | `stackra.config.ts`                                   | every generated file                                                                     |
| Dev port and host, domains, public values, channels, health | `runway.yaml`                                         | `vite.config.ts`, `playwright.config.ts`, `entry/electron.ts`, `electron-builder.yml`    |
| The env contract (`VITE_*`) and what each value feeds       | `src/config/env.config.ts`, `schemas/env-options`     | `gen/env.ts`, `env.d.ts`, the package configs it feeds                                   |
| Locales, overlays, fallbacks, URL prefixes, RTL, numerals   | `src/config/i18n.config.ts`                           | `gen/i18n.ts`, the RTL e2e projects, the HTML pages, manifests, offline pages, menus     |
| The theme, the logo, schemes and fonts                      | `src/config/theming.config.ts`                        | icons, the HTML pages, manifests, the theme toggle                                       |
| Handlers, caching preset, offline, push, updates, install   | `src/config/pwa.config.ts`                            | `pwa/manifest.<locale>.webmanifest`, `sw.ts`, the `/open`, `/share`, `/open-file` routes |
| Mode, windows, overlays, menus, tray, deep links, devices   | `src/config/desktop.config.ts`                        | `entry/electron.ts`, `electron-builder.yml`, `entitlements.mac.plist`, AppMenu           |
| CSP additions                                               | `src/config/csp.config.ts`                            | the Electron main, the web targets' headers                                              |
| Cache scope and age, queue replay and leader                | `src/config/query.config.ts`                          | the query context, `gen/wiring.ts`                                                       |
| Analytics driver and consent                                | `src/config/analytics.config.ts`, `consent.config.ts` | `gen/wiring.ts`, the settings page's privacy tab                                         |
| Error reporting, replay, vitals, field and bundle budgets   | `src/config/telemetry.config.ts` (`logger.telemetry`) | the reporter driver in `gen/wiring.ts`, `vite.config.ts` budgets                         |
| Panels                                                      | `src/panels/`                                         | `gen/panels.ts` in every member, `routes.tsx`                                            |
| Screens                                                     | `src/routes/<name>/`                                  | `.stackra/routes.tsx`, `gen/routes.ts`                                                   |
| Default documents                                           | `src/documents/*.document.ts`                         | the `document:` routes; a published tenant document wins                                 |
| Shadows of a package's renderer or widget placement         | `src/overrides/<owner>/…`                             | `gen/resources.ts`, `stackra.manifest.json` `ui.overrides`                               |

## Tests

| File                                                  | Tier | Entry                           | Proves                                                                         |
| ----------------------------------------------------- | ---- | ------------------------------- | ------------------------------------------------------------------------------ |
| `components/**/__tests__/*.test.tsx`                  | unit | `@stackra/testing/react`        | every component in `en` and `ar`: refusals, paging, the tenant queue rule      |
| `overrides/**/__tests__/*.test.tsx`                   | unit | `@stackra/testing/react`        | the PointsBalance shadow with the kit's Props                                  |
| `stores/__tests__/`, `shortcuts/__tests__/`           | unit | `mountStore`, `runShortcut`     | density and the sidebar; one test per shortcut                                 |
| `schemas/__tests__/`, `blocks/*/__tests__/`           | unit | `validate`, `@stackra/testing`  | the derived form and `toInput`; a block's route-key check                      |
| `routes/*/__tests__/*.route.test.ts(x)`, `*.test.tsx` | unit | `renderRoute`, `runRouteLoader` | loaders, submits, the shell's session check, documents, flags, overlays, share |
| `routes/*/__tests__/*.e2e.test.ts`                    | e2e  | `@stackra/testing/e2e`          | shell, resources, palette, offline and the per-locale offline page, desktop    |

Client fakes take one shape everywhere: `fakeClient((fake) => fake.on(OrderKpisQuery).returns(…))`,
asserted with `client.called(OrderKpisQuery)`. A failure is a real error class, never `new Error`: a
refusal with `.throws(refusal(InsufficientStockError))`, a lost connection with
`.throws(TransportError.create({ reason: "network" }))` (`TransportError` from `@stackra/clients`).

## Catalog entries this member needs (root `pnpm-workspace.yaml`)

Runtime dependencies:
`@stackra/{actions,analytics,app,assets,clients,config,consent,container,contracts,coordinator,csp,errors,experience,feature-flags,filesystem,i18n,iam,icons,identity,logger,media,navigation,panel,peripherals,platform,query,realtime,settings,shortcuts,state,storage,tenancy,theming,tokens,ui,validation}`
in `catalog:stackra` (`@acme/theme`, the `acme` theme, and `@acme/loyalty-kit`, whose react entry
ships the renderers of its two Custom widgets, are workspace packages); `react`, `react-dom`,
`react-router`, `zod` (the generated schemas import it) and `@heroui-pro/react` (HeroUI Pro, Stackra
ADR 0197 as amended (stackra#127)) in the default catalog; `@heroui/styles` in `catalog:ui`;
`tailwindcss` and `workbox-*` in `catalog:frontend`.

Development dependencies: `@stackra/{cli,gen,runway,testing,vite-plugin}` in `catalog:stackra`
(`@stackra/gen` brings `classComponents()` for Vite); the workspace presets
`@stackra/{typescript,vitest}-config`; `@types/{node,react,react-dom}` in the default catalog;
`electron`, `typescript` and `vite` in `catalog:build`; `@playwright/test`, `jsdom`, `oxfmt`,
`oxlint` and `vitest` in `catalog:quality`. electron-builder is a dependency of `@stackra/platform`,
which runs it for `stackra build --target desktop`.

### HeroUI Pro licence

The shell (`AppLayout`, `Navbar`, `Sidebar`), the palette (`Command`), the inbox and pending-changes
sheets (`Sheet`), the empty and offline states (`EmptyState`), and the dashboard and PointsBalance
tiles (`KPI`) use HeroUI Pro directly from `@heroui-pro/react` (Stackra ADR 0197 as amended
(stackra#127)); every other primitive is the free HeroUI behind `@stackra/ui`. Installing therefore
needs a HeroUI Pro licence. The token is `HEROUI_PERSONAL_TOKEN` in Infisical: locally
`pnpm install:pro`, and in CI the OIDC step of `release.yml`, hand it to the package's postinstall
as `HEROUI_AUTH_TOKEN`; the root guard `.github/scripts/heroui-pro.mjs`, which both run, stops early
with a clear message when the token or the installed package is missing. It never sits in a file or
in the repository; the root README section "HeroUI Pro licence" has the details. A team that copies
this template needs its own HeroUI Pro licence, or replaces those components with free `@stackra/ui`
ones.
