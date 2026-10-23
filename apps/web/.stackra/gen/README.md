# apps/web/.stackra/gen (generated, gitignored; committed here only to read)

Built from the `stackra.manifest.json` of the services this app imports from
`#stackra/clients/<service>` (inferred, no consumed-services list), filtered to the `public` API
area, the pinned acme-platform manifests of `stackra.lock.yaml`, plus the app's own `assets/`, the
config classes and the kind classes under `src/`. In Vite the same modules are served virtually with
HMR by `@stackra/vite-plugin`; tests and agents read these files. App code imports them only as
`#stackra/<name>` (ADR 0261). Every file is complete; none is an excerpt.

| File                   | Holds                                                                                                                                                                                                                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `env.ts`               | the validated public `env` (browser) and `serverEnv(raw)` (Worker), both from `EnvConfig`                                                                                                                                                                                        |
| `clients/<service>.ts` | one file per consumed service (`commerce`, `billing`, `content`, `experience`, `marketing`): its public query, action and refusal classes by their real names (`GetProductBySlugQuery`, `ProductNotFoundError`) and shapes (`X$`, `X`), imported as `#stackra/clients/<service>` |
| `clients.server.ts`    | `publicClients(env, request, { locale, market })` for the Worker, with the forwarded request facts and the pinned `apiVersion`                                                                                                                                                   |
| `i18n.ts`              | the complete `I18n` key tree with the derived keys, the loaders with the regional overlays, the fallback chains, the applied string overrides                                                                                                                                    |
| `routes.ts`            | `Routes` by route key (the route folder) and the `RouteKey` type a block's call to action holds                                                                                                                                                                                  |
| `flags.ts`             | `Flags.web.pricing_yearly_first` and `Flags.web.help_centre` from the flag classes in `src/flags/`                                                                                                                                                                               |
| `sitemap.ts`           | `sitemapSources`: the marketing routes, builder pages, storefront products                                                                                                                                                                                                       |
| `assets.ts`            | `Assets.web.public.logo_svg`                                                                                                                                                                                                                                                     |
| `wiring.ts`            | the one module `web`, bindings, config overrides, contexts and driver candidates (lazy imports) for the web target                                                                                                                                                               |

There is no `overrides.ts`: the site replaces no block or Custom widget renderer, and its two string
overrides (`src/overrides/marketing/leads/assets/lang/<locale>/leads.json`) are merged into the
`.stackra/lang` copies and listed in `i18n.ts`. `../entry/` holds the runtime entries.
