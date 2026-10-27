<!--
Stackra file contract:
Purpose: what lives under apps/ in a product repository started from the lean starter.
Boundary: placement only; the grammar is the root AGENTS.md.
Runtime: none (documentation)
Governing contract: Stackra ADR 0294 and 0295 (apps and their generated entries), D16 (products ship
                    packages, no apps by default), stackra-15
-->

# apps

Client members (`tier:app`). The lean starter ships one, `apps/docs`; a product adds an app only
when it needs one (D16), and its web and mobile surfaces usually come from the OS shells through the
root runway's `surfaces` and `mobile` blocks (ADR 0441) instead. An app renders what services
declare (resources, widgets, documents, settings pages) and adds its own routes, layouts, panels,
menus, shortcuts, stores, blocks and documents. Each is a class whose base is its kind
(`extends Route({ path })`, `extends Component<Props>` for a component, compiled by gen to a
function component), in the group folder its suffix belongs to (ADR 0294 as amended by programming
model v3.1, see the root `AGENTS.md`). Apps never import a service: they import its generated
classes by name from `#stackra/clients/<service>`, built from the producer's committed
`stackra.manifest.json`, and gen copies the consumed services' lang files into `.stackra/lang/` (ADR
0003, 0261).

| App    | Targets  | What it is                                                                  |
| ------ | -------- | --------------------------------------------------------------------------- |
| `docs` | Mintlify | the project docs; the API reference is generated from the service manifests |

Layout per app (not docs, which has no TypeScript runtime and no root module, rule R12):

```text
apps/<name>/
├── package.json · stackra.config.ts (what it IS) · runway.yaml (what it needs, per environment)
│   · stackra.manifest.json (committed contract) · turbo.jsonc · tsconfig.json · README.md · AGENTS.md
├── assets/{lang/<locale>/<namespace>.json, public/}            own strings (en, ar, en-US, ar-SA), files
├── src/<name>.module.ts                                         only to narrow client imports or wrap
├── src/config/ · src/schemas/                                   config classes, their options schemas, overrides
├── src/{panels,menus,shortcuts,documents,stores,flags,analytics}/   one kind per folder
├── src/{routes,blocks,components}/<name>/                       folder kinds: class, page, props, hook, tests
├── src/overrides/<owner>/…                                      shadows of files the app does not own
└── .stackra/                                            generated, gitignored: entry/<target>.ts, tool configs, gen/
```

No app has an authored entry or tool config: `stackra gen` writes `.stackra/entry/<target>.ts`
(`createApp(<Name>Module, { wiring })` from `@stackra/app/<target>`) and every Vite, Expo, Metro,
Wrangler, Playwright and electron-builder file, with gitignored shims at the member root for tools
that read only the root (ADR 0295, decisions 5 and 7). Code hatches are the closed set of
`*.extend.ts` files, each with a `Reason:` header (ADR 0295 decision 6). The apps also keep their
own shapes in `src/schemas/` and their own refusals in `src/errors/`. No app ships an error
boundary: `@stackra/navigation` owns the root one, and a route adds `<name>.error.tsx` only to
customise its own.
