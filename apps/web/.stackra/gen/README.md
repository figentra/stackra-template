# apps/web/.stackra/gen (generated, gitignored; committed here only to read)

Built from the manifests of the services this app imports from `#stackra/clients` (inferred), filtered to the
`public` API area, the pinned figentra-os manifests of `stackra-manifests.lock.yaml`, plus the app's config classes,
route classes, flags, assets and overrides. App code imports these only as `#stackra/<name>`. Every file is complete.

| File                | What gen derived                                                                                    |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| `env.ts`            | the validated public `env` (browser) and `serverEnv(raw)` (Worker), both from `WebEnv`              |
| `clients.ts`        | `Commerce`, `Billing`, `Content`, `Experience`, `Marketing`: public Zod descriptors and schemas      |
| `clients.server.ts` | `publicClients(env, { locale, market })` for the Worker                                             |
| `i18n.ts`           | the complete `I18n` key tree, loaders, applied overrides, `loadMessages`, `translatorFor`           |
| `routes.ts`         | `Routes` by snake_case key and the `RouteKey` type a block's call to action holds                  |
| `flags.ts`          | `Flags.web.pricing_yearly_first` from the `@Flag` classes in `src/flags/`                           |
| `sitemap.ts`        | `sitemapSources`: prerendered routes, builder pages, storefront products                           |
| `overrides.ts`      | the override map with the check result                                                              |
| `wiring.ts`         | modules, bindings and driver candidates (lazy imports) for the `web-ssr` target                     |

In Vite the same modules are served virtually with HMR by `@stackra/vite-plugin`; tests and agents read the files.
