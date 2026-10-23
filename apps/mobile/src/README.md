# src

The groups of an app (ADR 0294 decision 14); a group folder appears with its first file.

| Folder / file        | Owns                                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| `mobile.module.ts`   | the root module: the remote modules compiled into the binary; everything else is discovered by folder    |
| `config/`            | config classes: overrides of the packages' configs (their presence mounts each context) and `EnvConfig`  |
| `routes/<name>/`     | one folder per route or layout: `<name>.route.ts` or `.layout.ts`, the page class `<name>.tsx`, its hook |
| `components/<name>/` | shared class components with their `<name>.props.ts`                                                     |
| `blocks/<name>/`     | page-builder blocks: the declaration (its props as fields) and its renderer                              |
| `documents/`         | default documents the routes render until a tenant publishes its own                                     |
| `menus/`             | the order card's context menu and the tab bar                                                            |
| `stores/`            | client state classes, persisted through `@stackra/storage`                                               |
| `schemas/`           | shape classes: route params, the form, the block's call to action, the env options                       |
| `types/`             | types only: each hook's result (`<name>.type.ts`)                                                        |
| `overrides/<owner>/` | the one tree that changes another member's files, mirroring the owner's path                             |
| `enums/`             | enums only this app uses (`CtaVerb`); a package's enum is imported, never redefined                      |
| `errors/`            | refusals this app raises (`SessionRequiredError`)                                                        |
| `analytics/`         | analytics events (`BarcodeScanned`)                                                                      |
| `styles/global.css`  | the one stylesheet entry                                                                                 |
| `__tests__/`         | the root module's boot test                                                                              |

No `providers/`: every context this app needs is a package's, mounted from its config class; the
folder would appear only for a `Module({ wrap })` component no package ships. No error boundary:
`@stackra/navigation` mounts the root boundary, and a route adds `<name>.error.tsx` only to
customise it. `overrides/` holds one string override (`commerce/orders/assets/lang/`). No `hooks/`
yet: it appears with the first hook two components share. No entry, navigator, linking, Expo, EAS or
Metro configuration here: gen writes them into `.stackra/` from `stackra.config.ts`, runway.yaml,
`config/` and the classes above.
