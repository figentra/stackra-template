# @figentra/acme-service-example

An example service: rename it to the product's first service or delete it. Until then it is the golden path a team
copies: one complete resource, **notes**, from the model to the routes, written the way a Stackra service is written.

A plain-TypeScript service member (`tier:service`) in the programming model v3 shape (ADR 0294, 0295). Feature
modules go in `src/modules/<key>/` (imported as `#modules/<key>/...`, the rest of `src/` as `#src/...`), files
under `assets/` are `#assets/...` and the `./assets/*` export. `stackra gen` writes the wiring, the server entry
and the Encore app into `.stackra/`. Nobody writes `main.ts`.

A note is a title and a text a tenant's user wrote. It is **tenant-owned**: every row carries its tenant, taken from the
call and never from the input, and the database's forced row-level policy refuses to show or change it for anyone else.
The policy is what isolates the rows. Because the service depends on `@stackra/database`, `@stackra/tenancy` and
`@stackra/testing`, gen writes the generated tenant-isolation test.

> **Known gap (STA-2807).** Gen does not yet bind the pipeline's `CallIsolation`, `TenancyCheck` or `UnitOfWork` in a
> server, and no package binds them on its own. In a deployed server a call therefore runs without its tenant set, so
> the forced policy shows no note and refuses every write: it fails closed and never leaks, but the service cannot
> serve a note until a core gen change binds `@stackra/tenancy`'s drivers. The integration tests bind these drivers by
> hand, so they prove the service's behaviour under the ports, not that a server has them. `note-wiring.test.ts` marks
> each missing port with `it.fails`; drop the `.fails` when the template's core pin binds it.

| Operation | Key                   | Route                    | Permission          | Risk | Notes                                              |
| --------- | --------------------- | ------------------------ | ------------------- | ---- | -------------------------------------------------- |
| Create    | `notes.note.create@1` | `POST /notes`            | `notes.note.create` | L2   | `Idempotency-Key` required; records `note.created` |
| Get       | `notes.note.get@1`    | `GET /notes/:noteId`     | `notes.note.read`   | L0   | another tenant's note is `not_found`               |
| List      | `notes.note.list@1`   | `GET /notes`             | `notes.note.read`   | L0   | newest first, cursor pages                         |
| Update    | `notes.note.update@1` | `PATCH /notes/:noteId`   | `notes.note.update` | L2   | a field left out is kept; records `note.updated`   |
| Delete    | `notes.note.delete@1` | `DELETE /notes/:noteId`  | `notes.note.delete` | L2   | records `note.deleted`                             |

The routes are in the service's API area (`ApiArea.App`, `stackra.config.ts`). Callers are users and agents
(`ActorKind.User`, `ActorKind.Agent`); every operation is an MCP tool too.

## What it shows

| Concern     | Where                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| Model       | `models/note.model.ts`: `Model.with(HasPublicId("not"), BelongsToTenant, Timestamps)`, field rules as `@Str` decorators   |
| Migration   | `database/migrations/0001-create-notes.migration.ts`: `t.belongsToTenant()` adds `tenant_id` and the forced policy        |
| Actions     | `actions/*.action.ts` and `queries/*.query.ts`: one class each, key and actors in `Action({ ... })`, behaviour in `handle` |
| Validation  | `schemas/*.schema.ts`: input and output shapes; the `@Str` bounds are enforced before `handle`                            |
| Permissions | `access/note.permissions.ts`: the risk of each verb; gen derives `notes.note.<verb>` and warns on a write below L2         |
| Idempotency | `note.create` requires `Idempotency-Key`: a retry with the same key answers the first note and adds none                  |
| Tenancy     | the call's tenant is the one `BelongsToTenant` rows take; no input names a tenant; `NoteService` runs under the policy    |
| Events      | `events/note-*.event.ts`: integration events recorded on the model (`note.record(...)`), ids only, sent with the row      |
| Errors      | `errors/empty-note-update.error.ts`: a typed refusal with a stable code (`empty_note_update`, HTTP 400)                   |
| Factory     | `database/factories/note.factory.ts`, for tests and demo data                                                             |

## Tests

- `pnpm test`, the unit tier: each action and query with a stand-in service, the view mapping, the refusal, the
  recorded events, the module's contract as gen derived it (a tenant-owned model, a permission per operation,
  writes at L2 or above, the required key on create), and `note-wiring`, which checks the generated wiring for the
  pipeline's tenant ports (each still `it.fails`, the known gap of STA-2807).
- `pnpm test:int`, the integration tier on Postgres (Docker): `note-pipeline` runs the five operations through the real
  actions pipeline with the real idempotency store, call isolation and unit of work, bound by the test itself (a
  retried create, a create without its key, the permission asked before the write); `note-isolation` proves, as the
  `NOBYPASSRLS` service role, that tenant B cannot list, get, update or delete tenant A's notes, that a read with no
  tenant returns none and that a write naming another tenant is refused by the policy (Postgres error 42501); and gen's
  `.stackra/tests/tenant-isolation.int.test.ts` audits every table of the service.

How IAM decides a permission is IAM's own test: the integration tests bind an allow-all access control, or one that
records the permission asked and refuses, so what they prove is the service's behaviour and the database's isolation.

## Commands

| Command                                        | Does                                                                                    |
| ---------------------------------------------- | --------------------------------------------------------------------------------------- |
| `stackra gen`                                  | Writes the wiring, entries, migrations and Encore app into `.stackra/` and the manifest |
| `stackra gen --check`                          | Fails when the committed `stackra.manifest.json` and `openapi.json` are stale           |
| `pnpm test` / `pnpm test:int`                  | The unit tests / the integration tests (Docker)                                         |
| `pnpm typecheck` / `pnpm lint` / `pnpm format` | The usual checks                                                                        |
