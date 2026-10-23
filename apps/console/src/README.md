# src

The groups of an app (ADR 0294 decision 14); a group folder appears with its first file.

| Folder / file        | Owns                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| `panels/`            | the two panels the console hosts: tenant admin at `/` (admin area), customer portal at `/portal`        |
| `config/`            | config classes: overrides of the packages' configs (their presence mounts each context) and `EnvConfig` |
| `routes/<name>/`     | one folder per route or layout: `<name>.route.ts` or `.layout.ts`, the page class `<name>.tsx`, a hook  |
| `components/<name>/` | shared class components with their `<name>.props.ts` and, where they have one, their own hook           |
| `blocks/<name>/`     | page-builder blocks: the declaration (its props as fields) and its renderer                             |
| `documents/`         | default documents the routes render until a tenant publishes its own                                    |
| `shortcuts/`         | Shortcut classes the keyboard, the palette and the desktop menus share                                  |
| `menus/`             | the desktop menu bar and the tray menu                                                                  |
| `stores/`            | client state classes, persisted through `@stackra/storage` where they say so                            |
| `schemas/`           | shape classes: the forms, the device preferences, the tenant settings, the block's call to action, env  |
| `types/`             | types only: each hook's result (`<name>.type.ts`)                                                       |
| `hooks/`             | hooks with two or more importers (`useOnlineStatus`, `useVariantSearch`)                                |
| `enums/`             | enums only this app uses (`Density`, `SettingsTab`)                                                     |
| `overrides/<owner>/` | the one tree that changes another member's files, mirroring the owner's path                            |
| `styles/app.css`     | the one stylesheet entry: Tailwind v4, HeroUI v3, the token fonts and the `acme` theme                  |

No root module: the console has nothing to say that gen cannot derive, so the member is one module
keyed `console`. No `providers/`: every context the console needs is a package's, mounted from its
config class. No error boundary: `@stackra/navigation` mounts the root boundary, and a route adds
`<name>.error.tsx` only to customise it. No `analytics/` or `errors/` yet: they appear with the
console's first analytics event and its first refusal. No entry, router, Vite, service-worker,
Electron or Playwright configuration here: gen writes them into `.stackra/` from
`stackra.config.ts`, runway.yaml, `config/` and the classes above.
