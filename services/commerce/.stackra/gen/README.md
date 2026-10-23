# .stackra (generated, gitignored; committed in this template only so it can be read)

`stackra gen` writes everything under `.stackra/` from one discovery pass over the member: each
file's path gives its kind, its base class gives its options, and its types give its shapes
(Stackra ADR 0294). Code imports the gen modules only as `#stackra/<name>`. Never edit: the next run
overwrites, and `stackra gen --check` fails CI when anything here is stale. Every file is complete
(no excerpts). The committed contract is not here: `stackra.manifest.json` and `openapi.json` sit
at the member root.

| File                   | Holds                                                                                        | Read it to answer                          |
| ---------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `../entry/server.ts`   | the runtime entry: `createApp(CommerceModule, { wiring })` from `@stackra/app/server`        | "where does the service boot?"             |
| `module.ts`            | `CommerceModule`, written because no root module is authored (`#stackra/module`)              | "which modules and packages boot?"         |
| `../vitest.config.ts`  | the Vitest config (the service preset); the gitignored root `vitest.config.ts` re-exports it | "how do the tests run?"                    |
| `wiring.ts`            | every binding with its kind, lifetime and dependencies; extension points; config; drivers    | "what does X get injected with?"           |
| `schemas/<module>.ts`  | one Zod schema per shape class (`X$`) and the `X$Check` type proving it equals the class     | "what does gen validate for this shape?"   |
| `schemas/commerce.ts`  | the schemas of the member's config classes; overrides extend the package's own `Base$`       | "what are the config defaults and rules?"  |
| `entities/<module>.ts` | the MikroORM EntitySchema of each model, in the module's Postgres schema                     | "which columns, keys and indexes exist?"   |
| `extensions.ts`        | every extension point, its `before` and `after` slots and their ordered extensions           | "who changes order totals, in what order?" |
| `operations.ts`        | the standard actions and queries written for resource operations set to `true`               | "where is catalogue.product.list?"         |
| `clients/<service>.ts` | one file per consumed service: client class, call shapes, event classes by real names       | "how do I call pricing?"                   |
| `tables.ts`            | table and column constants per model, schema-qualified, object form                          | "what is the column of `paidAt`?"          |
| `i18n.ts`              | the complete key tree of every namespace referenced, with loaders                            | "which i18n keys exist?"                   |
| `permissions.ts`       | the permission keys this member hosts, with risk, users, policy and system flag              | "which permissions exist?"                 |
| `events.ts`            | wire names, kinds, versions, broadcast channels and outbound webhooks                        | "what leaves through the outbox?"          |
| `slots.ts`             | the panel slots a widget may name, each with its place type (Band, Grid, Aside, Tabs)        | "which slots may a widget use?"            |
| `queues.ts`            | the worker queues this member may name                                                       | "which queue does a job run on?"           |
| `assets.ts`            | asset keys per module with files and overridability                                          | "which assets ship?"                       |
| `settings.ts`          | settings by path with scopes, lock, approval and client exposure; rules; flags; pages        | "what can a tenant change?"                |
| `migrations.ts`        | the typed ids `after:` names (`#stackra/migrations`) and the ordered stream of SQL steps     | "what runs on deploy, in what order?"      |
| `manifest.ts`          | typed view of the committed `../../stackra.manifest.json`, and the typed refusal refs        | "what does this service expose?"           |
| `ai.ts`                | MCP tools, facts classes, skills, prompts                                                    | "what can an agent call here?"             |
| `ui.ts`                | `Component` for the `.mail.tsx` bodies, from `@stackra/ui/react`                             | "what do mail bodies extend?"              |

This template commits the orders module's `schemas/orders.ts` and `entities/orders.ts`, the
reference module's output; gen writes the same pair for every module that declares shapes or
models. `.stackra/migrations/` (not shown) holds the SQL `stackra db compile` emits, and
`.stackra/encore/` the generated Encore app (ADR 0091, 0124).
