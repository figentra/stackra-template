# Tasks: a created app is clean by default; Figentra's setup is an opt-in internal profile

**Spec**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md) · **Linear**: STA-2877

- [x] T001 the `minimal` and `internal` profiles, the hand-written overlays and the first six
      derived overlays, with their tests and the template's README, llms.txt and AGENTS.md pointing
      at the profiles, in `stackra.starter.yaml`, `.github/scripts/starter-overlays.mjs`,
      `.github/scripts/__tests__/starter-overlays.test.mjs`, `starter/minimal/`, `README.md`,
      `llms.txt`, `AGENTS.md`, `.flow/readme.yml`, `.flow/lock.json` — covers: AC-001, AC-002,
      AC-006, AC-007, P-001, P-002, P-006, P-007 — route: spec-task
- [x] T002 the app's own `AGENTS.md` and `CLAUDE.md`, the open rules and skills without the Flow
      header, the template guide and the oxfmt, oxlint and cspell configs without Flow, the process
      files moved to FURNITURE, and the whole-app scan, in `.github/scripts/starter-overlays.mjs`,
      `.github/scripts/__tests__/starter-overlays.test.mjs`, `stackra.starter.yaml`,
      `starter/minimal/` — covers: AC-003, AC-004, P-003, P-004 — route: spec-task — deps: T001
- [x] T003 the minimal Quality Gate's `Test` step and its refusal of the build-box note, in
      `.github/scripts/starter-overlays.mjs`, `.github/scripts/__tests__/starter-overlays.test.mjs`,
      `starter/minimal/.github/workflows/ci.yml` — covers: AC-005, P-005 — route: spec-task — deps:
      T001
