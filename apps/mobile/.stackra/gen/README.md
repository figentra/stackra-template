# apps/mobile/.stackra/gen (generated, gitignored; committed here only to read)

Built from one discovery pass over the member (each file's path gives its kind, its base class its
options, its types its shapes; ADR 0294), the committed manifests of the services this app consumes
(the remote modules `src/mobile.module.ts` imports), the app's own `assets/lang`,
`assets/overrides/` and the capability map of the `expo` target (ADR 0250). Metro serves these files
from disk; `stackra dev` rewrites them on save. Code imports them only as `#stackra/<name>`, and
authored code never imports `schemas/`.

| File                | Holds                                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| `wiring.ts`         | the client container wiring: modules, bindings (routes, layout, menus, store), config overrides, drivers  |
| `schemas/mobile.ts` | one Zod schema per shape class and config class of the app (`X$`) with its `X$Check`                      |
| `env.ts`            | every public env read as a literal (`publicEnv`) and the validated `MobileEnvConfig` instance                   |
| `routes.ts`         | `Routes` (route key → route reference), the `RouteKey` enum, the typed params of every route              |
| `route-table.ts`    | route key → route class and its page, for the generated entry and tree only                               |
| `navigation.tsx`    | the React Navigation 7 tree built from the route folders, the tab bar menu and `MobileChromeConfig`       |
| `linking.ts`        | the linking config for `<scheme>://` and `<appOrigin>/m/`                                                 |
| `modules.ts`        | the modules compiled into this binary, in dependency order                                                |
| `clients.ts`        | `Commerce`, `Notifications`, `Identity`, `Experience`: modules, actions, queries, enums, events, refusals |
| `i18n.ts`           | the typed `I18n` tree and `I18nKey`, the lazy namespace loaders (`mobile` is the app's own), overrides    |
| `widgets.ts`        | the widgets of the slots this app's pages render, with their query and built-in display                   |
| `offline.ts`        | the offline map from each consumed action's `offline` option                                              |
| `capabilities.ts`   | what the `expo` driver offers, and which route, file or mounted context requires which capability         |
| `slots.ts`          | `Slots`: the panel's slot names                                                                           |
| `flags.ts`          | `Flags`: the consumed feature flags                                                                       |
| `settings.ts`       | `Settings`: the consumed user-scope settings with field schemas and labels                                |

There is no `overrides.ts` (the app overrides no block or Custom widget; its one string override is
in `i18n.ts`) and no `panels.ts` (the app hosts no panel; its home page renders a slot).
