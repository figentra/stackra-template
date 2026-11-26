# Feature Specification: the example service wires privacy, retention and the write audit

**Feature Branch**: `figentra/sta-1583-template-privacy-retention`

**Created**: 2026-11-26

**Status**: Implementing

**Tier**: feature

**Approver**: the CTO (the change risk's approval stop)

**Linear**: STA-1583

**Clarifications status**: complete

**Input**: The enterprise day-1 audit (STA-1551) found that a template app has no data-subject
export or erasure, no retention and no `PersonalData` marking (GDPR, PDPL), and that the starter
binds no audit-trail driver (STA-1571). Core ships all of it (`@stackra/privacy`,
`@stackra/data-maintenance`, `@stackra/access-log`); the starter used none. This change wires them
into `services/example` on top of the tenant-safe notes golden path (stackra-template#62) and the
0.33.0 catalog (stackra-template#58, merged into the branch). The write audit's binding waits for
core: `@stackra/access-log` 0.33.0 cannot append on Postgres, and the pipeline awaits the trail
inside each write's transaction, so binding it would roll back every note write. The Infisical
identities named in STA-1583 are the owner's and are not part of it.

### Sources

- `services/example/src/modules/notes/` (model, migration, create action, service) and its tests
- `@stackra/privacy` README (the declaration, the jobs, what a host wires),
  `@stackra/data-maintenance` README (the prune job), `@stackra/access-log` README (the write
  audit), `@stackra/model` `Retention`
- ADR 0189 (decisions 1, 2 and 4), ADR 0134 (decisions 3 and 4), ADR 0212 (decision 3), ADR 0465
  (decision 4), ADR 0294 (decisions 15 and 16: `@Replaces`), ADR 0098 (decisions 6 and 7: the actor
  chain)
- The Postgres run of `note-privacy.int.test.ts` on box 2 at the 0.33.0 line

## Impact

- **Apps touched**: none
- **Services touched**: `services/example` (notes module, a new `compliance` module, README,
  AGENTS.md)
- **Packages touched**: none in this repo; core's `@stackra/access-log` fix is its own change
  (stackra `figentra/sta-1583-access-log-chain-head`)
- **Public contract change**: the service manifest and OpenAPI gain the privacy, data-maintenance
  and access-log actions, jobs, permissions and events that gen registers from the new dependencies;
  `notes.notes` gains `author_id` (in migration 0001, which #62 already rewrites for the starter);
  the note's HTTP shapes are unchanged (`NoteView` does not carry the author)
- **Cross-service events**: `privacy.subject.erased.v1` is now recorded by an erasure
- **Tenancy and data**: `author_id` is a public id from the call's actor; every new table
  (`privacy.*`, `access_log.*`, `data_maintenance.*`) is tenant-partitioned by its package, and
  gen's tenant-isolation test covers them
- **Security and privacy**: adds data-subject export and erasure, a two-year storage limit on notes
  and legal holds; the per-tenant hash-chained write audit is not bound yet (AC-007); the AGENTS.md
  PII table lists each store
- **Secrets**: none
- **ADR needed**: no; implements the ADRs above as written
- **New dependencies**: `@stackra/privacy`, `@stackra/data-maintenance`, `@stackra/access-log`,
  `@stackra/logger`, `@stackra/config`, `@stackra/filesystem` (all `catalog:stackra`)
- **Deploy modes**: same in all three; the export disk is runway's `filesystem.disk` (`local` in
  dev, `s3` elsewhere)
- **Licence tier**: free (MIT core packages; the starter is UNLICENSED product code)
- **UI surfaces**: none
- **Docs to update**: `services/example/README.md`, `services/example/AGENTS.md`
- **Lane**: full
- **Change risk**: R2 (personal-data handling and the audit write path of every action; no auth,
  secret or HTTP shape change)

## Acceptance criteria

- **AC-001**: WHEN a note is created, THE service SHALL store the call's originating principal (followed through `onBehalfOf`) as `authorId`, never a value from the input.
- **AC-002**: THE notes module SHALL register a `PersonalData` declaration whose subject is `authorId` and whose `title` and `body` are deleted on erasure, loaded wherever `NoteService` is.
- **AC-003**: WHEN a data-subject export runs in a tenant, THE export SHALL hold that person's notes of that tenant and no other person's or tenant's.
- **AC-004**: WHEN an erasure runs in a tenant, THE saga SHALL delete that person's notes there, keep a note under a legal hold and count it as kept.
- **AC-005**: WHEN the nightly prune job runs in a tenant, THE job SHALL delete notes not changed for two years and keep younger notes and every note of an author under a legal hold.
- **AC-006**: THE service SHALL bind privacy's Postgres `HoldRegistry`, `SubjectHolds` and `SubjectSaltStore`, and schedule the record prune, outbox prune, access-log purge and export purge jobs.
- **AC-007**: WHILE the catalog's `@stackra/access-log` cannot append on Postgres (0.33.0), THE service SHALL bind no `AuditTrail`; the catalog bump to the release carrying the core fix (stackra `figentra/sta-1583-access-log-chain-head`) binds it and proves a done and a refused call reach the tenant's chain.
- **AC-008**: WHEN a note is created, updated or deleted through the actions pipeline with the ports the service's generated wiring binds, THE write SHALL commit.

## Status history

- 2026-11-26 → Clarified (the gaps, from STA-1551 and STA-1571 as STA-1583 lists them)
- 2026-11-26 → Planned (plan.md)
- 2026-11-26 → Implementing (built in this branch; proven on Postgres at the 0.33.0 line)
- 2026-11-26 → Implementing (review rework: #58 merged in and the outputs regenerated with gen
  0.33; the `AuditTrail` binding held back until core's access-log fix is released, AC-007 and
  AC-008)
