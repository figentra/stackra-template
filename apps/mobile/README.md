# @acme/mobile

The iOS and Android app of a Stackra project: Expo SDK 57, **code-based** React Navigation 7 (native
stack and native tab bar, iOS 26 Liquid Glass), `@stackra/ui/native` (HeroUI Native underneath) and
Uniwind on the `acme` theme of `@acme/theme`. Built to the Stackra programming model (ADR 0294, as
amended by v3.1 in the root AGENTS.md): every class states its kind once, in its base class
(`extends Route({...})`, `extends Menu({ kind })`, `extends Store({ persist })`), and its folder
says what it is; pages, layouts' screens, blocks' renderers and components are class components
(`extends Component<Props>` from `@stackra/ui/native`, Props in `<name>.props.ts`), which gen
compiles to function components; hooks stay functions; one exported declaration per file; nothing is
referenced by string (permissions, actions, queries, enums, i18n keys and routes are generated
constants, and titles, labels and keys are derived from names). A mobile "screen" is a route with
native presentation options, the same term as web and console. Its module set is fixed when the
binary is built (`src/mobile.module.ts` `imports`). The runtime (the entry, the navigation tree,
linking, the Expo configuration, EAS profiles, Metro, Maestro) is generated into `.stackra/` (ADR
0295); Expo's own Babel default compiles it, with gen's class-component pass as Metro's transformer,
so no Babel config exists.

| Command                                | Does                                                                                              |
| -------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `pnpm gen`                             | `stackra gen`: rewrites `.stackra/` and `stackra.manifest.json` from the member and the manifests |
| `pnpm dev` / `dev:ios` / `dev:android` | Metro on the runway port with gen on save; the platform variants build a dev client and run it    |
| `pnpm build`                           | `stackra build` (EAS, profile from `--profile`, fingerprint-gated)                                |
| `pnpm test` / `test:e2e`               | vitest (jsdom) / Maestro flows against the `e2e` profile, every locale                            |
| `pnpm typecheck`                       | gen, then tsc over `src`, `stackra.config.ts`, `.stackra`                                         |
| `pnpm run doctor`                      | `expo install --check` through the toolkit: native versions match the SDK                         |

## Where a fact goes (ADR 0295 decision 4)

| Question about a fact                                                         | File                          | Here                                                                                                |
| ----------------------------------------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------- |
| What is the app, for build tools? (targets, area, env, name, scheme, ids)     | `stackra.config.ts`           | `defineApp({ targets, area, env: EnvConfig, name, scheme, ios, android, expo, eas, maestro, e2e })` |
| Which remote modules does the binary ship?                                    | `src/mobile.module.ts`        | `Module({ imports: [IdentityModule, …] })`, each from `#stackra/clients/<service>`                  |
| What does the running app read? (chrome, locales, theme, packages' behaviour) | `src/config/<fact>.config.ts` | `EnvConfig` (`Config({ schema: EnvOptions, env })`) and twelve overrides (`X extends BaseX`)        |
| What differs per environment? (Metro port, public values, EAS profiles)       | `runway.yaml`                 | `version: 3`: port, `EXPO_PUBLIC_*` values, EAS profiles and channels, Sentry project, config       |
| Accounts, vendor ids, the release policy                                      | root `runway.yaml`            | not in this member (`providers.expo`, `providers.apple`, `targets.eas`)                             |
| Derivable from declarations?                                                  | nowhere: `.stackra/`          | generated                                                                                           |

## Tree

```text
apps/mobile
├── stackra.config.ts          defineApp: targets, area, env class, identity, Expo/EAS/Maestro/e2e sections
├── stackra.manifest.json      COMMITTED contract: routes, layouts, menus, blocks, documents, config, consumed services
├── runway.yaml                version 3: dev port, vars, EAS profiles/channels, Sentry project, config values
├── package.json               #src/*, #assets/* and #stackra/* imports; `main` is the generated entry
├── tsconfig.json              the mobile preset, nothing local
├── .gitignore                 .stackra/ and the generated root shims
├── app.config.ts · metro.config.js · eas.json · vitest.config.ts   GENERATED root shims (gitignored)
├── src/
│   ├── mobile.module.ts       the root module: the remote modules compiled into the binary
│   ├── config/                EnvConfig and the package overrides `X extends BaseX` (their presence mounts each context)
│   ├── routes/<name>/         <name>.route.ts (or tabs.layout.ts), the page class <name>.tsx, use-<name>.ts, __tests__/
│   ├── components/<name>/     shared class components, <name>.props.ts, index.ts
│   ├── blocks/promo-banner/   the block (its props as fields) and its renderer
│   ├── documents/             the default announcements document (kind Page)
│   ├── menus/                 the order card's context menu, the tab bar (MenuKind.TabBar)
│   ├── stores/                the preferences store (remembered tenant per user)
│   ├── schemas/               route params, the form, the block's call to action, EnvOptions
│   ├── types/                 the hooks' result types (`<name>.type.ts`)
│   ├── overrides/             commerce/orders/assets/lang/: this app's wording of one orders string
│   ├── enums/                 CtaVerb (consent categories are @stackra/consent's ConsentCategory)
│   ├── errors/                SessionRequiredError
│   ├── analytics/             BarcodeScanned
│   └── styles/global.css      Tailwind v4, Uniwind, HeroUI Native and the `acme` theme
├── assets/                    lang/{en,ar}/{mobile,pages,documents}.json, lang/{en-US,ar-SA}/ overlays, public/logo.svg
└── .stackra/                  GENERATED: entry/native.ts, app.config.ts, eas.json, eas-sync.json, metro.config.js,
                               vitest.config.ts, env.d.ts, maestro/, lang/, gen/{wiring,schemas,env,routes,route-table,
                               navigation,linking,modules,clients/<service>,i18n,widgets,offline,capabilities,slots,flags,
                               settings}
```

## What comes from where at run time

| Need                                      | Source                                                                        | Used in                                                   |
| ----------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------- |
| Actions, queries, events, enums, refusals | `#stackra/clients/<service>` (`GetOrderQuery`, `OrderPaid`, `OrderStatus`, …) | routes (`permission`, `loader`), hooks, menus             |
| Typed routes and params                   | `#stackra/routes` (`Routes` by route key, the `RouteKey` enum, `RouteParams`) | `navigate.to(Routes.key, params)`, `Routes[key]` for data |
| The navigation tree                       | `#stackra/navigation` (route folders, the tab bar menu, `ChromeConfig`)       | `.stackra/entry/native.ts` through `createApp`            |
| Which modules are built in                | `#stackra/modules` (from `src/mobile.module.ts`)                              | entitlement gating in the panel                           |
| Dashboard widgets and slots               | `#stackra/widgets`, `#stackra/slots`                                          | `WidgetSlot slot={Slots.Dashboard.Header}` on home        |
| Feature flags                             | `#stackra/flags` (`Flags.orders.quick_order`)                                 | `flag:` on the scan route, `useFlag` on its buttons       |
| User settings pages                       | `#stackra/settings` (`SettingsPages.messages`, `Settings.messages.*`)         | the notification preferences page                         |
| Strings                                   | `#stackra/i18n` (`I18n.pages.*`, `I18n.mobile.*`, `I18n.orders.*`, typed)     | every `t(I18n.…)`                                         |
| Offline policy per action                 | `#stackra/offline`                                                            | the query context, the offline banner                     |
| Device capabilities                       | `#stackra/capabilities` (the `expo` driver's map)                             | `useCapability("scanner" \| "network")`                   |
| Package contexts (session, tenancy, …)    | the config overrides in `src/config/`, mounted by `createApp` in graph order  | every page, through the packages' hooks                   |
| Tenant-editable documents                 | `Route({ document })` → `GetDocumentQuery`, else the class                    | `AnnouncementsRoute`; blocks registered in `blocks/`      |

## Tests

| File                                        | Tier | Entry                         | Proves                                                                                                    |
| ------------------------------------------- | ---- | ----------------------------- | --------------------------------------------------------------------------------------------------------- |
| `src/__tests__/mobile.module.test.ts`       | unit | `@stackra/container/testing`  | the root boots on the generated wiring; modules load in order; overrides replace the packages' bases      |
| `routes/tabs/__tests__/tabs.layout.test.ts` | unit | `@stackra/navigation/testing` | the layout's loader redirects signed out and selects the remembered tenant                                |
| `routes/*/__tests__/*.test.tsx`             | unit | `renderRoute`                 | states, loader by params, online vs queued submit, flag and capability gates, Arabic plurals, RTL and axe |
| `components/*/__tests__/*.test.tsx`         | unit | `@stackra/testing/native`     | renders in `en` and `ar` (RTL), formats money, status from the enum                                       |
| `blocks/`, `stores/`, `schemas/` tests      | unit | fakes                         | block props and events, the remembered tenant, the form's bounds                                          |
| `routes/*/__tests__/*.flow.yaml`            | e2e  | Maestro                       | sign-in, create-order, offline queue; iOS and Android, every locale                                       |

## Catalog entries this member needs (root `pnpm-workspace.yaml`)

`@stackra/{actions,analytics,app,cli,clients,config,consent,container,contracts,errors,events,experience,feature-flags,gen,i18n,iam,identity,logger,navigation,panel,platform,query,realtime,runway,settings,state,storage,tenancy,testing,theming,ui,validation}`
in `catalog:stackra`; `zod` (the generated schemas import it), `react`, `@types/react` and
`@types/node` from the default catalog; the `mobile` catalog (expo, react-native, heroui-native,
uniwind, the Expo modules, react-native-bottom-tabs, Sentry); `tailwindcss` from `frontend` and
`typescript` from `build`. `@acme/theme` and the `@stackra/{typescript,vitest}-config` presets are
`workspace:*`. Maestro and eas-cli are mise-pinned CLIs, not npm dependencies.

## Locales

`en` and `ar` are the base languages: each namespace (`mobile`, `pages`, `documents`) has a complete
file per base language in `assets/lang/<locale>/`. `en-US` and `ar-SA` are regional overlays: they
hold only the keys whose wording differs (US spelling; the Saudi word for a barcode) and fall back
to their base, then to `en`, through `src/config/i18n.config.ts` `fallbacks`. The rules live in
`@stackra/i18n` (loading, plural rules, the fallback chain), the config class lists the locales, and
gen types the keys, checks every base locale and writes one Maestro run per locale. Another module's
wording is changed in the overrides tree, `src/overrides/<owner>/…/assets/lang/`, merged key by key
over the owner's file.

## The repository-root `.easignore`

EAS uploads from the repository root and reads only the root `.easignore`, which replaces every
`.gitignore` for the upload. `stackra gen` writes it (ADR 0295 decision 5): the repository ignores,
minus the `.stackra/*` rules, plus the members a mobile build never compiles, and it re-includes
this member's `.stackra/` and root shims, which are gitignored but are the build's input.
