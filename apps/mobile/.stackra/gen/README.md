# apps/mobile/.stackra/gen (generated, gitignored; committed here only to read)

Built from the committed manifests of the services this app consumes (inferred from
`#stackra/clients` imports), filtered to `stackra.config.ts` `modules` (the compile-time module
list, ordered topologically from the manifests' dependency graph), the decorated classes under
`src/`, the app's own `assets/lang`, `src/overrides/` and the capability map of the `expo` target
(ADR 0250). Metro serves these files from disk; `stackra dev` rewrites them on save. Code imports
them only as `#stackra/<name>`.

| File              | Holds                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| `env.ts`          | the validated `MobileEnv` instance (`env.apiOrigin`, …), parsed once through the class's field rules       |
| `routes.ts`       | `Routes` (snake route key → route class), `RouteKey`, `routeKeys`, the typed params of every route         |
| `navigation.tsx`  | the React Navigation 7 tree built from the `@Route` and `@Layout` classes                                  |
| `linking.ts`      | the linking config for `<release.scheme>://` and `<appOrigin>/m/`                                          |
| `modules.ts`      | the modules compiled into this binary, in dependency order                                                |
| `clients.ts`      | `Commerce`, `Notifications`, `Devices`, `Experience`: Zod descriptors for actions, queries, permissions, enums, override points, widgets, events, refusals |
| `i18n.ts`         | the typed `I18n` tree and `I18nKey`, the lazy namespace loaders (`mobile` is the app's own), applied overrides, RTL set |
| `widgets.ts`      | the widget declarations of the hosted panels, with their slot, query and component point                   |
| `offline.ts`      | the offline map from `@Action({ offline })`                                                                |
| `capabilities.ts` | what the `expo` driver offers, and which route or file requires which capability                           |
| `overrides.ts`    | every override of this app with the check result                                                           |
| `wiring.ts`       | the client container wiring: modules, bindings, lazy driver candidates per port, check results             |
| `slots.ts`        | `Slots`: the panel's slot names                                                                           |
| `panels.ts`       | `Panels`: every `@Panel` key in the workspace                                                             |
| `flags.ts`        | `Flags`: the consumed `@Flag` declarations                                                                 |
| `settings.ts`     | `Settings`: the consumed user-scope settings with field schemas and labels                                |
