# Tasks: the example service wires privacy, retention and the write audit

**Spec**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md) · **Linear**: STA-1583

- [x] T001 the note's author from the call's actor, with its column, factory default and tests, in
      `services/example/src/modules/notes/functions/note-author-of.function.ts`,
      `services/example/src/modules/notes/functions/__tests__/note-author-of.function.test.ts`,
      `services/example/src/modules/notes/actions/create-note.action.ts`,
      `services/example/src/modules/notes/actions/__tests__/create-note.action.test.ts`,
      `services/example/src/modules/notes/models/note.model.ts`,
      `services/example/src/modules/notes/database/migrations/0001-create-notes.migration.ts`,
      `services/example/src/modules/notes/database/factories/note.factory.ts` — covers: AC-001,
      P-001 — route: spec-task
- [x] T002 the personal-data declaration, the hold link and the retention, with their test, in
      `services/example/src/modules/notes/privacy/note.personal-data.ts`,
      `services/example/src/modules/notes/privacy/__tests__/note.personal-data.test.ts`,
      `services/example/src/modules/notes/constants/note-retention.constant.ts`,
      `services/example/src/modules/notes/services/note.service.ts` — covers: AC-002, P-002 — route:
      spec-task — deps: T001
- [x] T003 the compliance drivers and their wiring test, the new dependencies, the regenerated
      manifest and OpenAPI, in
      `services/example/src/modules/compliance/drivers/postgres-audit-trail.driver.ts`,
      `services/example/src/modules/compliance/drivers/postgres-hold-registry.driver.ts`,
      `services/example/src/modules/compliance/drivers/postgres-subject-holds.driver.ts`,
      `services/example/src/modules/compliance/drivers/postgres-subject-salt-store.driver.ts`,
      `services/example/src/modules/compliance/__tests__/compliance-wiring.test.ts`,
      `services/example/package.json`, `services/example/stackra.manifest.json`,
      `services/example/openapi.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml` — covers: AC-006,
      P-005 — route: spec-task
- [x] T004 the Postgres proof of export, erasure, prune and audit, in
      `services/example/src/modules/notes/__tests__/note-privacy.int.test.ts`,
      `services/example/src/modules/notes/__tests__/note-isolation.int.test.ts` — covers: AC-003,
      AC-004, AC-005, AC-007, P-003, P-004 — route: spec-task — deps: T002, T003
- [x] T005 the README, AGENTS.md and spelling words, in `services/example/README.md`,
      `services/example/AGENTS.md`, `cspell.config.yaml` — covers: AC-002, AC-006 — route: spec-task
      — deps: T004
