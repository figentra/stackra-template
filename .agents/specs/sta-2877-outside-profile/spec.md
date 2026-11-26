# Feature Specification: a created app is clean by default; Figentra's setup is an opt-in internal profile

**Feature Branch**: `figentra/sta-2877-outside-profile`

**Created**: 2026-11-26

**Status**: Implementing

**Tier**: feature

**Approver**: the CTO (technical-only stop; the approval is recorded by the CTO, not by this branch)

**Linear**: STA-2877

**Clarifications status**: complete

**Input**: STA-2877 (split from STA-2790, batch 24 stage 1 of STA-2796). `stackra create` with its
default profile `minimal` wrote every root file and dot folder of this template into the new app:
workflows that need Figentra's GitHub Apps and secrets, a code owner the user cannot reach, Figentra
Flow as a dev dependency, Figentra scopes in `.npmrc`, MCP servers for Figentra's own tools, and an
agent setup (AGENTS.md, CLAUDE.md, `.agents/`) that tells a coding agent to run `fflow`,
`figentra linear`, `figentra delegate` and `pnpm bot:gh`, none of which the app has. The Quality
Gate it copied ran no tests, because Figentra runs its tests on its own build box (STA-2064).

### Sources

- STA-2877 and its review findings (the agent contract still required Flow; the derived gate ran no
  tests)
- `stackra.starter.yaml` (the profiles `create` reads; ADR 0515 decisions 3, 5 and 6)
- `.github/scripts/starter-overlays.mjs` and its test
  `.github/scripts/__tests__/starter-overlays.test.mjs`
- `starter/minimal/` (the overlays the minimal profile writes over the root files)

## Impact

- **Apps touched**: every app `stackra create` makes from here on (default profile `minimal`)
- **Services touched**: none
- **Packages touched**: `@stackra/starter` (the packed template: `stackra.starter.yaml` and
  `starter/minimal/`)
- **Public contract change**: `stackra.starter.yaml` (the starter manifest): `minimal` names each
  root file and tooling path it writes and overlays the files that carry Figentra's setup; the old
  minimal becomes the opt-in `internal` profile (`stackra create --profile internal`); `full` is
  unchanged. Additive for `create`: the manifest's shape (`rename`, `profiles.<name>.include`,
  `profiles.<name>.overlay`) does not change
- **Cross-service events**: none
- **Tenancy and data**: none
- **Security and privacy**: a created app no longer carries Figentra's bot identity, registry token
  or code owners; the Claude settings keep their deny rules for secret export
- **Secrets**: none
- **ADR needed**: no (implements ADR 0515 decisions 5 and 6 as written)
- **New dependencies**: none
- **Deploy modes**: same in all three
- **Licence tier**: free (MIT, this repo)
- **UI surfaces**: none
- **Docs to update**: `starter/minimal/README.md`, `starter/minimal/CONTRIBUTING.md`,
  `starter/minimal/AGENTS.md` (derived), `starter/minimal/docs/template-guide.md` (derived), the
  file contract of `stackra.starter.yaml`
- **Lane**: full
- **Change risk**: R2 (every created app's root files, agent setup and Quality Gate change)

## Acceptance criteria

- **AC-001**: THE default `minimal` profile SHALL write none of Figentra's furniture: Flow, code
  owners, the deploy, release and Flow workflows, the registry-token action, the agent hooks and
  personas, the model routing, the process rules and skills, and the OpenCode setup.
- **AC-002**: THE minimal profile SHALL write the root files that carry Figentra's setup from
  `starter/minimal/`, and every derived overlay SHALL equal what `starter-overlays.mjs` derives from
  its root file.
- **AC-003**: THE minimal app's AGENTS.md and CLAUDE.md SHALL be its own (no Flow header, no
  Figentra Flow section), and its `.agents/` SHALL hold only the framework's open rules and skills,
  without the Flow header.
- **AC-004**: No file the minimal profile writes, overlays included, SHALL name Figentra's process
  or tools: `fflow`, Figentra Flow, `.flow/`, `flow.config.json`,
  `figentra agents|linear|delegate|bot`, `pnpm linear`, the bot scripts, Linear release records, the
  agent paths only Figentra's setup has, its build box, its secrets repository or its branch names.
- **AC-005**: THE minimal Quality Gate SHALL run each member's tests (`turbo run test`, affected on
  a pull request), and a transform SHALL refuse a root gate that still says the tests run on
  Figentra's box.
- **AC-006**: Every root and tooling path of the template SHALL be a choice: written by minimal,
  Figentra's furniture, or template-only.
- **AC-007**: THE opt-in `internal` profile SHALL keep Figentra's setup for an app Figentra runs.

## Compatibility and migration

- An app created before this change keeps its files; nothing rewrites it. A team that wants
  Figentra's setup in a new app passes `--profile internal`.
- The manifest's shape is unchanged, so an older CLI reads the new profiles.

## Risks

- A root file that changes shape: each transform drops a known piece, then a post-condition refuses
  any Figentra token left over, so the derivation fails loudly instead of shipping furniture.
- The template guide still describes the whole template (for example `apps/docs`,
  `packages/application/example`); a minimal app's own guide is follow-up work for the agent-tree
  trim (AI2 item 1).

## Status history

- 2026-11-26 → Clarified (STA-2877 and the batch 24 audit)
- 2026-11-26 → Planned (plan.md)
- 2026-11-26 → Tasked (tasks.md)
- 2026-11-26 → Implementing (built in the same branch; review findings on the agent contract and the
  gate's tests addressed)
