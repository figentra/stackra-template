# apps/console/.stackra/gen (generated, gitignored; committed here only to read)

Built from the manifests of the services this app imports from `#stackra/clients` (inferred, no `consumes` list), the
pinned acme-platform manifests of `stackra.lock.yaml`, the app's own `assets/lang`, `src/overrides`, the
config classes and the capability map of the active target (`web`, `pwa` or `desktop`, ADR 0249 and 0250). In Vite
the same modules are served virtually with HMR by `@stackra/vite-plugin`; tests, the Electron main process and agents
read these files. App code imports them only as `#stackra/<name>` (ADR 0261). Every file is complete; none is an
excerpt.

| File              | Holds                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| `env.ts`          | the validated `env: ConsoleEnv` parsed once from `import.meta.env`                                        |
| `clients.ts`      | `Commerce`, `Notifications`, `Platform`, `Experience`, `Identity`: Zod descriptors and rebuilt class enums |
| `i18n.ts`         | the complete `I18n` key tree, the loaders per namespace and locale, applied overrides                     |
| `routes.ts`       | `Routes` by snake_case key and the `RouteKey` type                                                        |
| `navigation.ts`   | the navigation tree of the tenant-admin panel, gate-filtered at runtime                                   |
| `resources.ts`    | `Resources.*` route constants, widget and resource declarations for `@stackra/panel`                      |
| `panels.ts`       | `Panels.TenantAdmin`, `Panels.CustomerPortal` from the `@Panel` classes                                   |
| `slots.ts`        | `Slots.Dashboard.Header` and friends                                                                      |
| `settings.ts`     | `Settings.<module>.<field>` keys with metadata and the generated `SettingsPages`                          |
| `intents.ts`      | the `intents` phrases of consumed actions and queries, for the palette and the intent router              |
| `flags.ts`        | `Flags.orders.quick_order` and every other consumed `@Flag`, with default, owner and expiry              |
| `offline.ts`      | the offline map from `@Action({ offline })`: what the mutation queue may hold, the conflict strategies    |
| `assets.ts`       | `Assets.console.public.logo_svg` and the consumed modules' public assets                                  |
| `capabilities.ts` | what the active target offers and which file requires which capability                                   |
| `overrides.ts`    | the override map: point → class, component, merge rule, check result                                      |
| `wiring.ts`       | the client container wiring: modules, bindings and driver candidates (lazy imports)                       |

`../desktop/` holds what gen writes for the Electron target; `../pwa/` the web manifest, icons and offline page.
