# apps/console/.stackra/gen (generated, gitignored; committed here only to read)

Built from the `stackra.manifest.json` of the services this app imports from `#stackra/clients`
(inferred, no consumed-services list), the pinned acme-platform manifests of `stackra.lock.yaml`,
the app's own `assets/lang`, the config classes, the kind classes under `src/` and the capability
map of the active target (`web`, `pwa` or `desktop`, ADR 0249 and 0250). In Vite the same modules
are served virtually with HMR by `@stackra/vite-plugin`; tests, the Electron main process and agents
read these files. App code imports them only as `#stackra/<name>` (ADR 0261). Every file is
complete; none is an excerpt.

| File              | Holds                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| `env.ts`          | the validated `env: ConsoleEnv` parsed once from `import.meta.env`                                     |
| `clients.ts`      | `Commerce`, `Notifications`, `Platform`, `Experience`, `Identity`: descriptors, `Enum.of` enums, shapes |
| `i18n.ts`         | the complete `I18n` key tree with the derived keys, the loaders per namespace and locale, overrides     |
| `routes.ts`       | `Routes` by route key (the route folder) and the `RouteKey` type                                       |
| `navigation.ts`   | the navigation tree of the tenant-admin panel, gate-filtered at runtime, and the PWA tabs              |
| `resources.ts`    | `Resources.*` route constants, widget and resource declarations for `@stackra/panel`                   |
| `panels.ts`       | `Panels.TenantAdmin`, `Panels.CustomerPortal` from the panel classes, with the area each hosts         |
| `slots.ts`        | `Slots.Dashboard.Header` and friends                                                                   |
| `settings.ts`     | `Settings.<module>.<field>` keys with metadata, `Settings.pick` and the generated `SettingsPages`      |
| `intents.ts`      | the `intents` phrases of consumed actions and queries, for the palette and the intent router           |
| `flags.ts`        | `Flags.orders.quick_order` and every other consumed flag, with default, scopes and expiry              |
| `offline.ts`      | the offline map from the actions' `offline` option: what the queue may hold, the conflict strategies   |
| `assets.ts`       | `Assets.console.public.logo_svg` and the consumed modules' public assets                               |
| `capabilities.ts` | what the active target offers and which file requires which capability                                |
| `wiring.ts`       | the renderer container wiring: bindings, config overrides, contexts, drivers (main's: `../desktop/`)   |

There is no `overrides.ts`: the console replaces no block or Custom widget renderer and shadows no
string. `../entry/` holds the runtime entries, `../desktop/` what gen writes for the Electron target
and `../pwa/` the web manifests, icons and offline page.
