# @acme/mobile

The iOS and Android app of a Stackra project: Expo SDK 57, **code-based** React Navigation 7 (native
stack + native tabs, iOS 26 Liquid Glass), `@stackra/ui/native` (HeroUI Native underneath) + Uniwind
on the Stackra brand tokens. Built to the Stackra authoring model: everything with identity is a
class with a kind decorator (`@App`, `@Route`, `@Layout`, `@Provider`, `@Store`, `@Block`,
`@Document`, `@Menu`, `@Override`, `@Config`, `@AnalyticsEvent`); React components are functions
referenced from decorator options; nothing is referenced by string (permissions, actions, queries,
enums, override points, i18n keys and routes are generated constants). A mobile "screen" is a route
with native presentation options, the same term as web and console. Its module set is fixed when the
binary is built (`stackra.config.ts` `modules`). The runtime (Expo config, EAS profiles, Metro,
Babel, the entry, the navigation tree, linking, Maestro) is generated into `.stackra/`.

| Command                                | Does                                                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `pnpm gen`                             | `stackra gen`: rewrites `.stackra/` from the four source files, the decorated classes and the manifests |
| `pnpm dev` / `dev:ios` / `dev:android` | Metro on the runway port with gen on save; the platform variants build a dev client and run it          |
| `pnpm build`                           | `stackra build` (EAS, profile from `--profile`, fingerprint-gated)                                      |
| `pnpm test` / `test:e2e`               | vitest (jsdom + react-native-web) / Maestro flows against the `e2e` profile, every locale               |
| `pnpm typecheck`                       | gen, then tsc over `src`, `stackra.config.ts`, `.stackra`                                               |
| `pnpm doctor`                          | `expo install --check` through the toolkit: native versions match the SDK                               |

## The four source files (one fact, one file)

| Question about a fact                                             | File                          | Here                                                                                        |
| ----------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------- |
| What is the app? (key, root, targets, area, env contract, e2e)    | `stackra.config.ts`           | `defineApp({ key: "mobile", module: "./src/mobile.app.ts", targets, env: MobileEnv, e2e })` |
| How do its packages behave?                                       | `src/config/<fact>.config.ts` | thirteen `@Config("mobile.<fact>")` classes with field decorators and `@Env`                |
| How and where does THIS app run, per environment?                 | `runway.yaml`                 | Metro port, `EXPO_PUBLIC_*` values, EAS profiles and channels, Sentry project               |
| What is the infrastructure? (accounts, EAS project, release, OTA) | root `runway.yaml`            | not in this member (`targets.eas` holds the staged OTA rollout)                             |
| Derivable from declarations?                                      | nowhere: `.stackra/`          | generated                                                                                   |

`consumes` is gone (gen infers the services from `#stackra/clients` imports); `modules` lives in
`stackra.config.ts` next to the rest of what the member is, ordered topologically by gen with
`priority` as the only tie-break.

## Tree

```
apps/mobile
├── stackra.config.ts          defineApp: key, @App root, targets, area, env class, e2e flows
├── expo.extend.ts             (absent) the Expo hatch: a function file merged last over the generated Expo config; only when an ADR names the exception
├── runway.yaml                per-environment: dev Metro port, vars, EAS profiles/channels, Sentry project
├── package.json               #src/*, #assets/* and #stackra/* imports; the Expo native modules
├── tsconfig.json              the expo preset, nothing local
├── .gitignore                 .stackra/* except app-manifest.json; the generated root shims
├── app.config.ts · babel.config.js · metro.config.js · eas.json   GENERATED root shims (gitignored): Expo/EAS read the member root
├── src/
│   ├── mobile.app.ts          @App: theme, the provider stack in order, the root layout, the hosted panel
│   ├── config/                one @Config class per fact (13): env, i18n, theming, identity, query, state, telemetry,
│   │                          push, release, realtime, analytics, consent, feature-flags
│   ├── enums/                 class enums only this app uses (ConsentCategory)
│   ├── errors/                AppError subclasses (SessionRequiredError)
│   ├── analytics/             @AnalyticsEvent classes (BarcodeScanned)
│   ├── menus/                 @Menu classes (the order card's context menu)
│   ├── routes/                @Route classes (*.route.ts), @Layout (tabs.layout.ts); __tests__/ guard test and the Maestro flows
│   ├── components/ui/         shared presentational components (ADR 0128 d2 folders)
│   ├── components/pages/      one page component per route + its own hook + __tests__
│   ├── blocks/                @Block classes with their components (promo-banner)
│   ├── documents/             @Document defaults for L2 documents (announcements)
│   ├── providers/             session, tenant, query, realtime, flags, push, theme: [.provider.ts] + .context.tsx + [hook]
│   ├── stores/                @Store classes on @stackra/state (preferences, persisted in prefs)
│   ├── schemas/               Schema(z) classes: route params, the form, the block props
│   ├── overrides/orders/      @Override of the RevenueSparkline point; lang overrides
│   ├── assets/                lang/{en,ar}/mobile.json, public/logo.svg
│   └── styles/global.css      Tailwind v4 + Uniwind + HeroUI Native + brand tokens
└── .stackra/                  GENERATED: app-manifest.json (committed), app.config.ts, eas.json, .easignore, eas-sync.json,
                               metro/babel, main.ts, env.d.ts, vitest.config.ts, maestro/, gen/{env,routes,navigation,linking,
                               modules,clients,i18n,widgets,offline,capabilities,overrides,wiring,slots,panels,flags,settings}
```

## What comes from where at runtime

| Need                                      | Source                                                                    | Used in                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------- |
| Actions, queries, events, enums, refusals | `#stackra/clients` (`Commerce`, `Notifications`, `Devices`, `Experience`) | routes (`permission`, `prefetch`), hooks, providers       |
| Typed routes and params                   | `#stackra/routes` (`Routes` by route key, `RouteKey`, `RouteParams`)      | `navigate.to(Routes.key, params)`, `Routes[key]` for data |
| The navigation tree                       | `#stackra/navigation` (from `@Route` and `@Layout`)                       | `.stackra/main.ts`                                        |
| Which modules are built in                | `#stackra/modules` (from `stackra.config.ts`)                             | entitlement gating in the panel                           |
| Dashboard widgets and slots               | `#stackra/widgets`, `#stackra/slots`, `#stackra/panels`                   | `WidgetSlot slot={Slots.Dashboard.Header}` on home        |
| Feature flags                             | `#stackra/flags` (`Flags.orders.quick_order`)                             | `flag:` on the scan route, `useFlag` on its buttons       |
| User settings pages                       | `#stackra/settings` (`SettingsPages.messages`, `Settings.messages.*`)     | the notification preferences page                         |
| Strings                                   | `#stackra/i18n` (`I18n.mobile.*`, `I18n.orders.*`, typed)                 | every `t(I18n.…)`                                         |
| Offline policy per action                 | `#stackra/offline`                                                        | the query provider, the offline banner                    |
| Device capabilities                       | `#stackra/capabilities` (the `expo` driver's map)                         | `useCapability("scanner"                                  | "push" | "network")` |
| Validated env                             | `useConfig(MobileEnv)`; `#stackra/env` for generated code                 | the session and realtime providers, linking               |
| Tenant-editable documents                 | `@Route({ document })` → `Experience.queries.GetDocument`, else the class | `AnnouncementsRoute`; blocks registered in `blocks/`      |

## Tests

| File                                                                                       | Tier | Entry                         | Proves                                                                                                    |
| ------------------------------------------------------------------------------------------ | ---- | ----------------------------- | --------------------------------------------------------------------------------------------------------- |
| `src/__tests__/mobile.app.test.ts`                                                         | unit | `@stackra/app/native`         | the root boots on the generated wiring; every override is declared; every required widget point is bound  |
| `routes/__tests__/*.layout.test.ts`                                                        | unit | `@stackra/navigation/testing` | the layout guard redirects                                                                                |
| `components/pages/*/__tests__/*.test.tsx`                                                  | unit | `renderRoute`                 | states, prefetch by params, online vs queued submit, flag and capability gates, Arabic plurals, RTL + axe |
| `components/ui/*/__tests__/*.test.tsx`                                                     | unit | `@stackra/testing/native`     | renders in `en` and `ar` (RTL), formats money, status from the enum                                       |
| `blocks/*/__tests__/`, `providers/*/__tests__/`, `stores/__tests__/`, `schemas/__tests__/` | unit | fakes                         | block events, session refusal, tenant hydrate, device registration, realtime lifecycle, pure schemas      |
| `routes/__tests__/*.flow.yaml`                                                             | e2e  | Maestro                       | sign-in, create-order, offline queue; iOS + Android, every locale                                         |

## Catalog entries this member needs (root `pnpm-workspace.yaml`)

`@stackra/{actions,analytics,app,cli,clients,config,consent,container,contracts,errors,experience,feature-flags,i18n,iam,identity,navigation,panel,platform,query,realtime,schema,settings,state,storage,tenancy,theming,ui,validation,testing,typescript-config}`
in `catalog:stackra`; the `mobile` catalog of the main repository (expo, react-native,
heroui-native, uniwind, the Expo modules, react-native-bottom-tabs). Maestro is a mise-pinned CLI,
not an npm dependency.
