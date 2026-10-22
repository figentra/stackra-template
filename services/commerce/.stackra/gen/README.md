# .stackra/gen (generated, gitignored; committed in this template only so it can be read)

`stackra gen` writes these from one discovery IR (ADR 0261). Code imports them as `#stackra/<name>`. Never edit: the
next run overwrites. `stackra gen --check` fails CI when they are stale. Every file is complete (no excerpts) and uses
the same class enums authored code uses.

| File             | Holds                                                                                   | Read it to answer                          |
| ---------------- | --------------------------------------------------------------------------------------- | ------------------------------------------ |
| `wiring.ts`      | every binding, its scope and module, the drivers with lazy candidates, the module graph | "what does X get injected with?"           |
| `hooks.ts`       | every hook point and its ordered implementers, with the files that call them            | "who changes order totals, in what order?" |
| `clients.ts`     | descriptors and client classes of the services this one consumes, with their transport  | "how do I call pricing?"                   |
| `crud.ts`        | action and query classes synthesised from `@Crud`                                       | "where is catalogue.product.list?"         |
| `tables.ts`      | table and column constants per model, object form                                       | "what is the column of `paidAt`?"          |
| `i18n.ts`        | the complete key tree of every namespace referenced, with loaders                       | "which i18n keys exist?"                   |
| `permissions.ts` | the permission keys this member hosts, with risk, users, policy and grantability        | "which permissions exist?"                 |
| `events.ts`      | wire names, visibility, broadcast channels and outbound webhooks                        | "what leaves through the outbox?"          |
| `slots.ts`       | the panel slots a widget may name                                                       | "which slots may a widget use?"            |
| `queues.ts`      | the worker queues this member may name                                                  | "which queue does a job run on?"           |
| `assets.ts`      | asset keys per module with files and overridability                                     | "which assets ship?"                       |
| `settings.ts`    | settings fields, flags and the settings pages                                           | "what can a tenant change?"                |
| `overrides.ts`   | override points declared here and overrides of other modules                            | "what did this member replace?"            |
| `migrations.ts`  | the ordered migration stream, package blueprints included                               | "what runs on deploy, in what order?"      |
| `manifest.ts`    | typed view of the committed `../app-manifest.json`, and the typed refusal refs          | "what does this service expose?"           |
| `ai.ts`          | MCP tools, facts classes, skills, prompts                                               | "what can an agent call here?"             |

`.stackra/migrations/` (not shown) holds the SQL `stackra db compile` emits; `.stackra/encore/` holds the generated
Encore app (ADR 0091, 0124).
