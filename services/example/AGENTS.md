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

## PII

| Data                    | Where                           | Handling                                                                                                                                                                     |
| ----------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A note's title and text | `notes.notes` (`title`, `body`) | Free text a user writes, so it may hold personal data. Stored under the tenant's row-level policy, returned only to that tenant, never put in an event, a log or an error. |
| The author's identity   | not stored                      | A note does not record its author; only the owning tenant (`tenant_id`).                                                                                                     |
