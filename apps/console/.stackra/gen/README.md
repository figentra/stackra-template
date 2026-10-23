# apps/console/.stackra/gen (generated, gitignored; committed here only to read)

Built from the `stackra.manifest.json` of the services this app imports from
`#stackra/clients/<service>` (inferred, no consumed-services list), the pinned acme-platform
manifests of `stackra.lock.yaml`, the app's own `assets/lang`, the config classes, the kind classes
under `src/` (including the shadows under `src/overrides/`) and the capability map of the active
target (`web`, `pwa` or `desktop`, ADR 0249 and 0250). In Vite the same modules are served virtually
with HMR by `@stackra/vite-plugin`; tests, the Electron main process and agents read these files.
App code imports them only as `#stackra/<name>` (ADR 0261). Every file is complete; none is an
excerpt.

| File                        | Holds                                                                                                       |
| --------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `env.ts`                    | the validated `env: EnvConfig` parsed once from `import.meta.env` through the class's `env` map             |
| `clients/<service>.ts`      | one file per consumed service (`commerce`, `notifications`, `platform`, `experience`, `identity`): each member as a named class |
| `i18n.ts`                   | the typed `I18n` key tree, the loaders per namespace and locale (overlays included), fallbacks and prefixes |
| `routes.ts`                 | `Routes` by route key (the route folder) and the `RouteKey` type                                            |
| `navigation.ts`             | the navigation tree of the tenant-admin panel, gate-filtered at runtime, and the PWA tabs                   |
| `resources.ts`              | `Resources.*` route constants, widget placements and resource declarations for `@stackra/panel`             |
| `panels.ts`                 | `Panels.TenantAdmin`, `Panels.CustomerPortal` from the panel classes, with the area each hosts              |
| `slots.ts`                  | `Slots.Dashboard.Header` and `.Main`, the shell's banner and checklist, the consumed dashboards' slots      |
| `settings.ts`               | `Settings.<module>.<field>` keys with metadata, `Settings.pick` and the generated `SettingsPages`           |
| `intents.ts`                | the intents of consumed actions and queries, with their phrases' i18n keys, for the palette                 |
| `flags.ts`                  | `Flags.orders.quick_order` and every other consumed flag, with default, scopes and expiry                   |
| `offline.ts`                | the offline map (what the queue may hold, the conflict strategies) and the offline page per locale          |
| `assets.ts`                 | `Assets.console.public.logo_svg` and the consumed modules' public assets                                    |
| `capabilities.ts`           | what the active target offers and which file requires which capability                                     |
| `wiring.ts`                 | the renderer container wiring: bindings, config overrides, contexts, drivers (main's: `../desktop/`)        |
| `ui.ts`                     | `Component`, the class-component base, from `@stackra/ui/react`, imported as `#stackra/ui`                  |

There is no `overrides.ts`: the two shadows the console keeps (`src/overrides/@acme/loyalty-kit/…`:
the `PointsBalance` renderer and the `PointsBalanceWidget` placement) are bound where they apply, in
`resources.ts` and `wiring.ts`, and listed in `stackra.manifest.json` `ui.overrides`. `../entry/`
holds the runtime entries, `../desktop/` what gen writes for the Electron target and `../pwa/` the
web manifests and icons.
