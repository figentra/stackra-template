# AGENTS — @figentra/acme-service-example

An example service: rename it to the product's first service or delete it. Member at `services/example`
(`tier:service`), in the programming model v3 shape. Until it is renamed it is the golden path: one tenant-owned
resource (`notes`) through the actions pipeline. Read the README for what each file shows.

## Rules that fail the build

- No Encore file or import, no `main.ts`, no tool config: gen writes them into `.stackra/`.
- No `"sideEffects": false` in `package.json`: the generated Encore files import `./database` for its side effect, and a
  bundler that honours the flag drops that import, so the app fails at boot with "no database url was provided".
- Never import another service; use its generated client or its events.
- A business value (a price, a rate, a country rule) is seed data or a setting, never code.
- Versions are `catalog:<name>` or `workspace:*` only.

## Rules a copy keeps

- The tenant is the call's, never the input's: no `tenantId` field on an input, no tenant read from a header or body.
  A tenant-owned table is declared with `BelongsToTenant` and `t.belongsToTenant()`; never hand-write its policy.
- Keep `@stackra/tenancy` (and `@stackra/database`, `@stackra/testing`) in `package.json`: without it gen refuses the
  `BelongsToTenant` model and writes no tenant-isolation test.
- The forced row policy is what isolates the rows. Gen does not yet bind the pipeline's `CallIsolation`,
  `TenancyCheck` or `UnitOfWork` in a server (STA-2807), so a deployed call runs with no tenant and the policy fails
  closed: no note is shown or written. Never work around it by setting `app.tenant_id` yourself or by a session-level
  `SET`; keep `note-wiring.test.ts` and drop each `.fails` once the core pin binds the port.
- Every read and write of a note goes through `NoteService` inside an action or query, so it runs in the pipeline's
  isolation transaction once `CallIsolation` is bound (STA-2807).
- A write is at least L2 and declares its `idempotency`; a create is `Idempotency.Required`. A refusal is a class in
  `errors/` with a stable code.
- Events are recorded on the model (`note.record(...)`) and carry ids only, never a title or a text.
- A new tenant-owned resource ships its isolation test in the integration tier (`pnpm test:int`, Postgres, the
  `NOBYPASSRLS` role), never in the unit tier.
- One declaration per file; each file sits in its kind's group folder under `src/modules/notes/`.
- A model that holds personal data ships a `privacy/<model>.personal-data.ts` (`PersonalData`, its subject and each
  field's erasure method), loaded by the model's service, and a `Retention`; the subject is a public id taken from the
  call's actor, never from input.
- Keep the `compliance` drivers (audit trail, legal holds, subject salts): without them writes are not audited and
  nothing is held. A host inside Figentra OS replaces the hold registry with the compliance service's driver.

## PII

| Data                    | Where                           | Handling                                                                                                                                                                     |
| ----------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A note's title and text | `notes.notes` (`title`, `body`) | Free text a user writes, so it may hold personal data. Stored under the tenant's row-level policy, returned only to that tenant, never put in an event, a log or an error. |
| The author's identity   | `notes.notes` (`author_id`)     | The public id of the call's originating principal (a user, also when an agent writes for them); the subject of export, erasure and holds. Never a name or an email.         |
| Write audit             | `access_log.audit_log_entries`  | Per tenant, append-only, hash-chained: action key, actor ids, outcome, refusal code and the ids a handler adds. Never a title or a text. Read with `access_log.audit_log_entry.read`. |
| Legal holds, salts      | `privacy.legal_holds`, `privacy.subject_salts` | Per tenant: the held record or person id, the reason and who placed it; the per-subject key salt destroyed on erasure.                                              |
| Subject exports         | the `filesystem.disk` export folder | A zip per request under a random name, behind a signed link that lives 7 days, deleted by the nightly purge.                                                            |
