# apps

Client members (`@figentra/<name>`, `tier:app`). An app renders what services declare (resources, widgets, documents,
settings pages) and adds its own routes, providers, stores, blocks and overrides, all as decorated classes discovered
from their kind folders (guides/programming-model.mdx#apps). Apps never import a service: they call it through the generated `#stackra/clients`
built from the producer's committed `.stackra/app-manifest.json`, and gen copies consumed services' lang files into
`.stackra/lang/` (ADR 0003, 0261).

| App       | Targets           | Shows                                                                                                       |
| --------- | ----------------- | ----------------------------------------------------------------------------------------------------------- |
| `console` | web, pwa, desktop | the tenant console: panel shell, resources from services, `@Flag`-gated QuickOrder, Electron bridge actions |
| `web`     | web-ssr (Workers) | the public site and storefront: L2 blocks, `StorefrontProductView`, the contact form with `RouteForm`       |
| `mobile`  | ios, android      | Expo with native tabs: offline queue, barcode scan by `Capability`, push, `modules` + `priority`            |
| `docs`    | Mintlify          | the project docs; the API reference is generated from the service manifests                                 |

Layout per app (not docs):

```
apps/<name>/
├── package.json · stackra.config.ts (what it IS) · runway.yaml (how and where it RUNS) · turbo.jsonc · tsconfig.json · README.md
├── assets/{lang/<locale>/<name>.json, public/}          the app's own namespace and files
├── src/{<name>.app.ts, config/ (how it BEHAVES), routes/, components/, providers/, stores/, blocks/, overrides/, schemas/, …}
└── .stackra/                                            generated: the entry (main.tsx / main.ts / root.tsx), bundler and
                                                         platform config, gen/; only app-manifest.json is committed
```

No app has an authored entry: `stackra gen` writes `createApp(<App>, { wiring })` into `.stackra/`.
