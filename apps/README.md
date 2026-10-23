# apps

Client members (`@acme/<name>`, `tier:app`). An app renders what services declare (resources,
widgets, documents, settings pages) and adds its own routes, layouts, panels, menus, shortcuts,
stores, blocks and documents. Each is a class whose base is its kind (`extends Route({ path })`), in
the group folder its suffix belongs to (ADR 0294, decisions 1 to 3 and 14). Apps never import a
service: they call it through the generated `#stackra/clients`, built from the producer's committed
`stackra.manifest.json`, and gen copies the consumed services' lang files into `.stackra/lang/` (ADR
0003, 0261).

| App       | Targets                               | Shows                                                                                                          |
| --------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `console` | web, pwa, desktop                     | the tenant console: two panels, resources from services, the flag-gated quick order, shortcuts, Electron       |
| `web`     | web (server-rendered on Workers), pwa | the public site and storefront: L2 blocks, `StorefrontProductView`, the contact form, SEO routes (ADR 0297)    |
| `mobile`  | ios, android                          | Expo with native tabs from routes and one tab-bar menu, chrome as a config class, offline queue, barcode, push |
| `docs`    | Mintlify                              | the project docs; the API reference is generated from the service manifests                                    |

Layout per app (not docs, which has no TypeScript runtime and no root module, rule R12):

```text
apps/<name>/
├── package.json · stackra.config.ts (what it IS) · runway.yaml (what it needs, per environment)
│   · stackra.manifest.json (committed contract) · turbo.jsonc · tsconfig.json · README.md · AGENTS.md
├── assets/{lang/<locale>/<name>.json, overrides/<namespace>/, public/}   own strings, string overrides, files
├── src/<name>.module.ts · app.error.tsx                                  the root module and the error boundary
├── src/config/                                                           config classes and package overrides
├── src/{panels,menus,shortcuts,documents,stores,flags,analytics}/        one kind per folder
├── src/{routes,blocks,components}/<name>/                                folder kinds: class, component, hook, tests
└── .stackra/                                            generated, gitignored: entry/<target>.ts, tool configs, gen/
```

No app has an authored entry or tool config: `stackra gen` writes `.stackra/entry/<target>.ts`
(`createApp(<Name>Module, { wiring })` from `@stackra/app/<target>`) and every Vite, Expo, Metro,
Wrangler, Playwright and electron-builder file, with gitignored shims at the member root for tools
that read only the root (ADR 0295, decisions 5 and 7). Code hatches are the closed set of
`*.extend.ts` files, each with a `Reason:` header (ADR 0295 decision 6). The apps also keep their
own shapes in `src/schemas/` and their own refusals in `src/errors/`, two of the app groups of ADR
0294 decision 14.
