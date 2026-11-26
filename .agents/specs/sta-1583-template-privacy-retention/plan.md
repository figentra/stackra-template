# Implementation Plan: the example service wires privacy, retention and the write audit

**Spec**: `.agents/specs/sta-1583-template-privacy-retention/spec.md` · **Linear**: STA-1583 ·
**Date**: 2026-11-26

**Input**: Feature specification from `.agents/specs/sta-1583-template-privacy-retention/spec.md`

## Summary

Record a note's author, declare the note's personal data and retention, and bind the Postgres
drivers the core privacy and audit packages leave to the host. Gen then registers the export,
erasure, purge and prune jobs from the new dependencies.

## Technical Context

- **Language**: TypeScript (ESM)
- **Members**: `services/example`
- **Testing**: vitest unit tests; the integration tier on Postgres (Testcontainers, the
  `NOBYPASSRLS` role)
- **Storage**: `notes.notes` (`author_id`), and the packages' `privacy`, `access_log` and
  `data_maintenance` tables
- **Runtime target**: a created app's services; the `stackra create` line (0.33) is the proven one

## Constitution Check

| Law                                   | Result | Note                                                                |
| ------------------------------------- | ------ | ------------------------------------------------------------------- |
| Boundaries (tier direction, ADR 0003) | PASS   | a service depends on core packages only                             |
| Secrets (ADR 0009)                    | PASS   | none; the export disk's credentials are runway's                    |
| Security                              | PASS   | adds erasure, holds, retention and the write audit                  |
| HTTP and events                       | PASS   | no note route changes; `privacy.subject.erased.v1` is the package's |
| Tenancy                               | PASS   | the author comes from the actor; every new table is per tenant      |
| Delegation                            | PASS   | Claude only                                                         |
| Not built yet (ADR 0011)              | N/A    | none                                                                |
| Test placement (ADR 0022)             | PASS   | `__tests__/`; Postgres cases in the `.int` tier                     |
| Versions and catalogs                 | PASS   | new deps from `catalog:stackra`                                     |
| Deploy modes (ADR 0076)               | PASS   | same in all three                                                   |
| Licence tier (ADR 0077)               | PASS   | free core packages                                                  |
| Docs and ADRs                         | PASS   | README and AGENTS.md                                                |

## Deploy modes

| Mode       | Behaviour                                                   |
| ---------- | ----------------------------------------------------------- |
| SaaS       | exports on the `s3` disk runway sets; jobs on the scheduler |
| On-prem    | same, with the host's S3-compatible disk                    |
| Air-gapped | same; MinIO as the `s3` disk                                |

## Correctness properties

- **P-001**: a created note's `authorId` is the end of the actor's `onBehalfOf` chain — Validates:
  AC-001
- **P-002**: `personalDataDeclarations()` holds exactly one notes entry once `NoteService` loads —
  Validates: AC-002
- **P-003**: export and erasure touch only the person's rows in the running tenant — Validates:
  AC-003, AC-004
- **P-004**: a held note or a held author's note survives the prune and the erasure — Validates:
  AC-004, AC-005
- **P-005**: the generated wiring replaces the four ports with the service's drivers — Validates:
  AC-006

## Architecture overview

The model carries `authorId` and `Retention(NOTE_RETENTION)`. `privacy/note.personal-data.ts`
registers the declaration and the `authorId` hold link, and `NoteService` imports it.
`compliance/drivers/*` subclass the packages' Postgres drivers with `@Replaces`, so gen's wiring
binds them. Gen registers the packages' jobs from the dependencies, and its boot connects the bound
hold registry.

## Components and responsibilities

- `noteAuthorOf(actor)`: the originating principal's public id.
- `CreateNoteAction`: stores `authorId` from the call's actor.
- `NotePersonalData`: the subject and erasure methods, and the hold link.
- `NOTE_RETENTION`: two years from `updatedAt`, hard delete.
- `PostgresAuditTrailDriver`, `PostgresHoldRegistryDriver`, `PostgresSubjectHoldsDriver`,
  `PostgresSubjectSaltStoreDriver`: the service's bindings of the four ports.

## Files and folders

```text
services/example/
  AGENTS.md
  README.md
  package.json
  openapi.json
  stackra.manifest.json
  src/modules/compliance/drivers/postgres-audit-trail.driver.ts
  src/modules/compliance/drivers/postgres-hold-registry.driver.ts
  src/modules/compliance/drivers/postgres-subject-holds.driver.ts
  src/modules/compliance/drivers/postgres-subject-salt-store.driver.ts
  src/modules/compliance/__tests__/compliance-wiring.test.ts
  src/modules/notes/actions/create-note.action.ts
  src/modules/notes/actions/__tests__/create-note.action.test.ts
  src/modules/notes/constants/note-retention.constant.ts
  src/modules/notes/database/factories/note.factory.ts
  src/modules/notes/database/migrations/0001-create-notes.migration.ts
  src/modules/notes/functions/note-author-of.function.ts
  src/modules/notes/functions/__tests__/note-author-of.function.test.ts
  src/modules/notes/models/note.model.ts
  src/modules/notes/privacy/note.personal-data.ts
  src/modules/notes/privacy/__tests__/note.personal-data.test.ts
  src/modules/notes/services/note.service.ts
  src/modules/notes/__tests__/note-isolation.int.test.ts
  src/modules/notes/__tests__/note-privacy.int.test.ts
pnpm-workspace.yaml
pnpm-lock.yaml
cspell.config.yaml
```

## Data models and migrations

`notes.notes` gains `author_id` (a public-id link column, not null, indexed) in migration 0001,
which the starter has not shipped yet (stackra-template#62 rewrites it). The packages bring their
own migrations.

## Contracts

- The note routes and `NoteView` are unchanged.
- The manifest and OpenAPI list what gen registers from the new packages:
  `privacy.subject.export@1`, `privacy.subject.erase@1`, `privacy.subject_export.purge@1`,
  `privacy.hold.place@1` / `release@1` / `list@1`, the data-maintenance jobs and synonym actions,
  and the access-log query, export and purge.

## Error handling

- An erasure that meets a held note keeps it and reports it as `kept`; it never fails for it.
- A prune chunk with held rows keeps them and logs each refusal to `privacy.legal_hold_refusals`.

## Security and tenancy

The author is the actor's, never the input's. Every new table has row-level security from its
package. The erasure and the export run in the tenant the pipeline sets, so a person in two tenants
is handled per tenant.

## Testing strategy

- AC-001: `create-note.action.test.ts` (a user and an agent on behalf of a user) and
  `note-author-of.function.test.ts`.
- AC-002: `note.personal-data.test.ts` (registered through `NoteService`).
- AC-003, AC-004, AC-005, AC-007: `note-privacy.int.test.ts` on Postgres.
- AC-006: `compliance-wiring.test.ts`.
- Each test fails with its change reverted (shown in the PR).

## Rollout

- The starter ships it to new apps; an app created before keeps its own code.
- The audit case is `it.fails` until the template's pin carries the core access-log fix.
- The service needs the 0.33 catalog (stackra-template#58); at 0.15.0 gen's imports for access-log
  and data-maintenance do not resolve.

## Known risks

- Until the core fix ships, binding access-log's `AuditTrail` makes every audited write fail on
  Postgres.
- `filesystem.disk: local` (dev) cannot sign an export link.

## Delegation and risk plan

Claude only; one wave; route `spec-task`. R2: the change waits for the CTO's approval stop before it
merges.

## ADRs

ADR 0189, ADR 0134, ADR 0212, ADR 0465, ADR 0294, kept as written.

## Docs

`services/example/README.md`, `services/example/AGENTS.md`.

## Complexity tracking

none
