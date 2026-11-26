# Implementation Plan: a created app is clean by default; Figentra's setup is an opt-in internal profile

**Spec**: `.agents/specs/sta-2877-outside-profile/spec.md` · **Linear**: STA-2877 · **Date**:
2026-11-26

**Input**: Feature specification from `.agents/specs/sta-2877-outside-profile/spec.md`

## Summary

`stackra.starter.yaml` gives `minimal` an explicit include list (each root file and tooling path
named) and an overlay map onto `starter/minimal/`. Five overlays are hand-written (README.md,
CONTRIBUTING.md, llms.txt, .npmrc, the root runway.yaml); the rest are derived from their root file
by `.github/scripts/starter-overlays.mjs`: package.json, pnpm-workspace.yaml, .mcp.yaml,
.claude/settings.json, lefthook.yml, the Quality Gate (with a Test step), AGENTS.md and CLAUDE.md,
the framework's open rules and skills, docs/template-guide.md and the oxfmt, oxlint and cspell
configs. The old minimal becomes `internal`. The script's FURNITURE list names what only `internal`
and `full` write.

## Technical Context

- **Language**: JavaScript (ESM, Node built-ins only)
- **Members**: the template root (`@stackra/starter` packs it)
- **Testing**: `node --test .github/scripts/__tests__/*.test.mjs` (the `scripts` check of
  preview-gate.mjs)
- **Storage**: none
- **Runtime target**: `stackra create`

## Constitution Check

| Law                                   | Result | Note                                                   |
| ------------------------------------- | ------ | ------------------------------------------------------ |
| Boundaries (tier direction, ADR 0003) | N/A    | data and a build script                                |
| Secrets (ADR 0009)                    | PASS   | no values; the bot identity and registry token go away |
| Security                              | PASS   | the secret-export deny rules stay                      |
| HTTP and events                       | N/A    | none                                                   |
| Tenancy                               | N/A    | none                                                   |
| Delegation                            | PASS   | Claude only                                            |
| Not built yet (ADR 0011)              | PASS   | nothing new                                            |
| Test placement (ADR 0022)             | PASS   | tests in `__tests__/`                                  |
| Versions and catalogs                 | PASS   | no version change                                      |
| Deploy modes (ADR 0076)               | PASS   | same in all three                                      |
| Licence tier (ADR 0077)               | PASS   | free, MIT                                              |
| Docs and ADRs                         | PASS   | the overlays and the manifest's file contract          |

## Deploy modes

| Mode       | Behaviour                                    |
| ---------- | -------------------------------------------- |
| SaaS       | a created app holds none of Figentra's setup |
| On-prem    | a created app holds none of Figentra's setup |
| Air-gapped | a created app holds none of Figentra's setup |

## Correctness properties

- **P-001**: no path the minimal profile writes matches FURNITURE — Validates: AC-001
- **P-002**: each overlay source is tracked under `starter/minimal/` and each derived one equals its
  derivation — Validates: AC-002
- **P-003**: minimal never writes the personas, routing or process rules and skills; AGENTS.md and
  CLAUDE.md come from `starter/minimal/` — Validates: AC-003
- **P-004**: a scan of every line of every file minimal writes finds none of the refused tokens (218
  hits before this change) — Validates: AC-004
- **P-005**: the minimal ci.yml has a guarded Test step running
  `turbo run test ${AFFECTED:+--affected}`, and `ciWorkflow` throws on "on the box" — Validates:
  AC-005
- **P-006**: every tracked root and dot path is minimal, furniture or template-only — Validates:
  AC-006
- **P-007**: internal writes `.flow/`, CODEOWNERS, the Flow and deploy workflows, the Flow guard
  hook, the personas and process rules, and keeps the root package.json, .npmrc, .mcp.yaml, Claude
  settings, AGENTS.md and Quality Gate — Validates: AC-007
