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

## Architecture overview

`stackra create` (the CLI) reads `stackra.starter.yaml` from the packed template, writes the tracked
files the chosen profile's `include` globs match, then copies each `overlay` source over its target.
This change is data and a build script on the template side only: the CLI is unchanged.

```text
root file ──(starter-overlays.mjs: transform + post-condition)──▶ starter/minimal/<path>
stackra.starter.yaml ── minimal: include + overlay ──▶ stackra create ──▶ the user's app
                     └─ internal: the old minimal (Figentra's setup kept)
```

Each derived overlay is the root file with Figentra's pieces removed by a named transform. After the
transform a post-condition refuses any Figentra token left over, so a root file that changes shape
fails the derivation instead of shipping furniture.

## Components and responsibilities

- **`stackra.starter.yaml`**: the profiles. `minimal` (default) names each root file and tooling
  path it writes and maps each overlay; `internal` is the old minimal; `full` is unchanged.
- **`.github/scripts/starter-overlays.mjs`**: FURNITURE (what only `internal` and `full` write),
  OPEN_AGENT_FILES (the framework's open rules and skills), the transforms (package.json,
  pnpm-workspace.yaml, .mcp.yaml, Claude settings, lefthook, ci.yml, AGENTS.md, CLAUDE.md, the agent
  files, the template guide, oxfmt, oxlint, cspell), `deriveOverlays`, `profileFiles` and the
  manifest's YAML-subset reader. Run as a script it rewrites the derived overlays.
- **`starter/minimal/`**: the overlay sources, five hand-written and the rest derived.
- **`.github/scripts/__tests__/starter-overlays.test.mjs`**: the checks, including the whole-app
  scan whose refused tokens live in the test, so a transform cannot weaken them.

## Files and folders

```text
.
├── AGENTS.md                 the template's own, pointing at the profiles
├── README.md                 the template's own, pointing at the profiles
├── llms.txt                  the template's own, pointing at the profiles
├── .oxfmtrc.jsonc            a spec's task list stays unwrapped
├── stackra.starter.yaml      the minimal, internal and full profiles
├── .flow/                    readme.yml (the README's profile section) and lock.json
├── .github/scripts/
│   ├── starter-overlays.mjs
│   └── __tests__/starter-overlays.test.mjs
└── starter/minimal/          every overlay source (listed below)
```

`starter/minimal/` holds AGENTS.md, CLAUDE.md, the open `.agents` rules and skills, README.md,
CONTRIBUTING.md, llms.txt, .npmrc, root-runway.yaml, package.json, pnpm-workspace.yaml, .mcp.yaml,
lefthook.yml, .oxfmtrc.jsonc, .oxlintrc.jsonc, cspell.config.yaml, .claude/settings.json,
.github/workflows/ci.yml and docs/template-guide.md. Five are hand-written (README.md,
CONTRIBUTING.md, llms.txt, .npmrc, root-runway.yaml); `node .github/scripts/starter-overlays.mjs`
derives the rest from their root file.

## Data models and migrations

None. The starter manifest's shape (`rename`, `profiles.<name>.include`, `profiles.<name>.overlay`)
is unchanged.

## Contracts

The starter manifest is the public contract `stackra create` reads (ADR 0515 decision 5). The
default profile's content changes; its shape does not, so an older CLI reads the new profiles.
`--profile internal` is the way to keep Figentra's setup.

## Error handling

A transform that cannot find the piece it removes, or leaves a Figentra token behind, throws with
the file and the token. `node .github/scripts/starter-overlays.mjs` then fails, and the test "the
derived overlays match their root files" fails on a stale overlay.

## Security and tenancy

A created app no longer carries Figentra's bot identity, registry token, code owners or secrets
repository path. The Claude settings keep their deny rules for secret export. No tenancy change.

## Testing strategy

`node --test ".github/scripts/__tests__/*.test.mjs"` (the `scripts` check of preview-gate.mjs). The
whole-app scan, the agent-setup test and the Test-step test fail on cbfd137, the commit before the
review fixes (218 refused lines found there). oxlint and oxfmt run on the touched files.

## Rollout

The next `@stackra/starter` publish carries it. Apps created before keep their files; nothing
rewrites them.
