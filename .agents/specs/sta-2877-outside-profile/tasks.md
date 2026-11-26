---
description: "Tasks for STA-2877: a created app is clean by default; Figentra's setup is an opt-in internal profile"
---

# Tasks: a created app is clean by default; Figentra's setup is an opt-in internal profile

**Input**: Design documents from `.agents/specs/sta-2877-outside-profile/`

**Prerequisites**: plan.md (required), spec.md (required)

**Spec**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md) · **Linear**: STA-2877

## Phase 1: The outside profile and the internal profile

**Goal**: `minimal` writes the app without Figentra's furniture; `internal` keeps it.

- [x] T001 Test first: the default profile is `minimal`, writes no FURNITURE path, overlays each root file that carries Figentra's setup, leaves no tooling path undecided, keeps the outside MCP set, and `internal` keeps Figentra's setup, in `.github/scripts/__tests__/starter-overlays.test.mjs` — covers: AC-001, AC-002, AC-006, AC-007, P-001, P-002, P-006, P-007 — route: tests
- [x] T002 Add the `minimal` and `internal` profiles to `stackra.starter.yaml`, the FURNITURE list, the transforms and the overlay derivation in `.github/scripts/starter-overlays.mjs`, the hand-written overlays `starter/minimal/README.md`, `starter/minimal/CONTRIBUTING.md`, `starter/minimal/llms.txt`, `starter/minimal/.npmrc`, `starter/minimal/root-runway.yaml`, the derived `starter/minimal/package.json`, `starter/minimal/pnpm-workspace.yaml`, `starter/minimal/.mcp.yaml`, `starter/minimal/.claude/settings.json`, `starter/minimal/lefthook.yml`, and the template's `README.md`, `llms.txt`, `AGENTS.md`, `.flow/readme.yml` and `.flow/lock.json` pointing at the profiles — covers: AC-001, AC-002, AC-006, AC-007, P-001, P-002, P-006, P-007 — route: spec-task — deps: T001

## Phase 2: The app's agent setup carries none of Figentra's process

**Goal**: a coding agent in a created app is never told to run a tool the app does not have.

- [x] T003 Test first: every line of every file `minimal` writes, overlays included, is free of `fflow`, Figentra Flow, `.flow/`, `figentra agents|linear|delegate|bot`, `pnpm linear`, the bot scripts, the build box and Figentra's branch names; the process agent files are never written; AGENTS.md and CLAUDE.md come from `starter/minimal/`, in `.github/scripts/__tests__/starter-overlays.test.mjs` — covers: AC-003, AC-004, P-003, P-004 — route: tests — deps: T002
- [x] T004 Derive the app's own `starter/minimal/AGENTS.md` and `starter/minimal/CLAUDE.md`, the open rules `starter/minimal/.agents/rules/http-conventions.md`, `starter/minimal/.agents/rules/module-boundary.md`, `starter/minimal/.agents/rules/naming-and-casing.md`, `starter/minimal/.agents/rules/not-built-yet.md`, `starter/minimal/.agents/rules/service-checklist.md`, `starter/minimal/.agents/rules/tenancy.md`, `starter/minimal/.agents/rules/versions.md` and skills `starter/minimal/.agents/skills/ai-mcp-tools/SKILL.md`, `starter/minimal/.agents/skills/backend-assets-and-storage/SKILL.md`, `starter/minimal/.agents/skills/backend-author-an-action/SKILL.md`, `starter/minimal/.agents/skills/backend-decorator-package-with-explorer/SKILL.md`, `starter/minimal/.agents/skills/backend-errors/SKILL.md`, `starter/minimal/.agents/skills/backend-gen-and-encore-target/SKILL.md`, `starter/minimal/.agents/skills/backend-module-and-root-module/SKILL.md`, `starter/minimal/.agents/skills/code-naming-and-casing/SKILL.md`, `starter/minimal/.agents/skills/db-models-and-migrations/SKILL.md`, `starter/minimal/.agents/skills/frontend-resource-console/SKILL.md` without the Flow header, `starter/minimal/docs/template-guide.md`, `starter/minimal/.oxfmtrc.jsonc`, `starter/minimal/.oxlintrc.jsonc` and `starter/minimal/cspell.config.yaml` without Flow, move the personas, routing and process rules and skills to FURNITURE in `.github/scripts/starter-overlays.mjs` and `stackra.starter.yaml`, and keep a spec's task list unwrapped in `.oxfmtrc.jsonc` — covers: AC-003, AC-004, P-003, P-004 — route: spec-task — deps: T003

## Phase 3: The app's Quality Gate runs its tests

**Goal**: a created app's broken tests never merge green.

- [x] T005 Test first: the `minimal` ci.yml has a guarded Test step running `turbo run test ${AFFECTED:+--affected}`, and `ciWorkflow` throws on a gate that says its tests run on the box, in `.github/scripts/__tests__/starter-overlays.test.mjs` — covers: AC-005, P-005 — route: tests — deps: T002
- [x] T006 Add the Test step to the `ciWorkflow` transform in `.github/scripts/starter-overlays.mjs` and derive `starter/minimal/.github/workflows/ci.yml` — covers: AC-005, P-005 — route: spec-task — deps: T005
- [x] T007 Checkpoint: `node --test ".github/scripts/__tests__/*.test.mjs"`
