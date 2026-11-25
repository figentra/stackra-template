# State of figentra/stackra-template

Dated 2026-11-07; sections 2 to 4 were updated on 2026-11-24 for the `@stackra/*` 0.33.0 branch (the
default-branch facts in sections 3 and 6 are still those of 2026-11-07). This file reports what has
been shown to work, separately from what is declared. Where it disagrees with another document,
check the evidence named here, then correct that document.

## 1. What this repository is

The lean starter for a Stackra product repository: one pnpm and Turborepo workspace with a docs app
(`apps/docs`), a web console (`apps/console`, minimal starter profile only), one example service
(`services/example`, module `notes`) and one example package (`packages/application/example`). The
placeholder product key is `acme`. It is a GitHub template repository (`is_template: true`), and its
release workflow is meant to publish it as `@stackra/starter`. Agent lanes work in it through
Figentra Flow (`fflow`, stackra preset); code owner is `@figentra-usr`.

## 2. Current

| Fact                    | Value                                                                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default branch head     | `main` at `12f5b42a37b55ea765fe066b7ef43a58d82f41e6` (2026-11-07, #41)                                                                                        |
| `@stackra/*` catalog    | `0.33.0`, exact, 89 entries in `catalogs.stackra` (`pnpm-workspace.yaml`); not 0.33.1, see section 4                                                          |
| Member versions         | root `acme-platform` 0.0.0; service and package 0.0.0; console 0.0.1; docs 0.1.0 (all private)                                                                |
| Figentra Flow           | `@figentra-oss/flow` 0.11.0 (core's pin); `.flow/lock.json` preset `stackra` 0.11.0                                                                           |
| Toolchain (`mise.toml`) | node 24.22.0, pnpm 12.16.1, oxfmt 0.71.0, oxlint 1.86.0, cspell 10.4.0, gitleaks 8.30.1, osv-scanner 2.7.0, encore 1.58.8, eas-cli 25.3.0, maestro cli-2.10.0 |
| Build tools (catalog)   | turbo 2.11.9, typescript 7.0.2, @changesets/cli 3.0.3, mint 4.2.1184                                                                                          |
| Tags                    | `v0.1.0-review.0` (2026-10-22), `pre-consolidate-2026-11-01`, 7 `archive/*` tags                                                                              |
| GitHub releases         | none                                                                                                                                                          |

## 3. Proven by a real run

All on `main` at `12f5b42` unless stated.

- CI Quality Gate passed: run 42336856556. Steps that ran: registry probe, pre-release gate, OSV
  scan, install, lint, typecheck, build, gen, validate repository, Squawk migration lint.
- fflow baseline passed: run 42336856693 (tasks lint, typecheck, build; brand pull).
- CodeQL passed: run 42336856386.
- Release workflow ran green: run 42336856558. Install and build passed in the `release` job.
- Main has been green since 447ec5a (2026-11-06, runs 42257961929 onward).
- Local run on the build box, 2026-11-24 (lane L8; log and screenshots in the Stackra notes,
  `notes-lanes/L8.md`). On `main` `d78a4fa` with `@stackra/*` 0.15.0: install, then
  `turbo run build typecheck lint test --concurrency=2` passed 15 of 15 tasks (9 tests);
  `pnpm verify` failed its secrets phase on a gitleaks false positive in history (`.gitleaksignore`,
  #57). On the 0.33.0 branch (#58): the same turbo run passed 15 of 15 (12 tests), and every
  `pnpm verify` phase, `pnpm validate`, `pnpm gen:check` and `fflow check` passed.
- `apps/docs` (`pnpm dev`, mint on :3333) and `apps/console` (`pnpm dev`, Vite on :3710) rendered in
  Chromium with no console error and no failed request, at 0.15.0 and at 0.33.0. The console draws
  unstyled: see section 4.

## 4. Not proven

- No test step runs in CI. Run 42336856556 has no `test` step, although the README says
  `pnpm verify` is "the gate CI runs". A green local `pnpm test` and `pnpm verify` is recorded in
  section 3 (the build box, 2026-11-24); no CI run of either is.
- `@stackra/*` 0.33.1 cannot be installed: 20 packages (csp, iam, tenancy, identity, state, scope,
  settings, query, ...) are at 0.33.1 in core's source but unpublished, while 70 published packages
  depend on them at exactly 0.33.1 (checked 2026-11-24). The catalog stays on 0.33.0 until core
  publishes them.
- `apps/console` ships unstyled: its Vite config is the authored stand-in without Tailwind, and
  `@stackra/vite-plugin` 0.33.0 does not install (pnpm `trustPolicy` refuses the trust downgrade of
  a pre-release fork of `rollup-plugin-off-main-thread` (3.0.0-pre1), reached through
  `vite-plugin-pwa` and `workbox-build`).
- `services/example` has not been run (it needs Encore and Postgres); its tests, build and typecheck
  pass.
- `@stackra/starter` is not published. In run 42336856558 the Starter job warned that the registry
  refused the publish (no trusted publisher for this repository), and the job still exited green. An
  anonymous `GET https://npm.stackra.figentra.com/@stackra%2fstarter` returns 404.
- No Changesets release: run 42336856558 warned "Failed to read changesets output"; no GitHub
  release or `v*` tag exists apart from `v0.1.0-review.0`. SBOM job: skipped.
- Deploy never ran here: in run 42336856592 only the registry probe ran; Owner gate, Promote and
  Deploy were skipped (by design: the template deploys nothing).
- `runway.yaml` (631 lines: surfaces, mobile, secrets, targets) and
  `starter/minimal/root-runway.yaml` are declared only; no Runway run against them is recorded here.
- The docs app targets Mintlify (`apps/docs/package.json` uses `mint`; `runway.yaml`
  `targets.mintlify`). Stackra ADR 0514 retires Mintlify for self-hosted docs. This target has never
  deployed from here.
- Mobile (EAS) and store assets under `assets/` are not built or submitted by any workflow run.
- The ADR 0525 link in `docs/template-guide.md` (line 327) returns 404 on docs.stackra.figentra.com
  (checked 2026-11-07); ADRs 0525 to 0528, cited across the workflows, are not on that site. The ADR
  index and ADR 0514 answer.

## 5. Map

| Path                                                       | One line                                                                                  |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `services/example/`                                        | `@figentra/acme-service-example`, the `notes` module; drift-checked against `stackra new` |
| `packages/application/example/`                            | `@figentra/acme-example`: console, native and landing entries                             |
| `apps/console/`                                            | `@figentra/acme-console`, the web console of the minimal profile                          |
| `apps/docs/`                                               | `@acme/docs`, docs pages and the project's ADR index (empty: no ADR yet)                  |
| `assets/`                                                  | brand, mobile, store, landing and lang sources                                            |
| `starter/minimal/`                                         | overlays for the minimal starter profile                                                  |
| `.github/workflows/`                                       | `ci.yml`, `release.yml`, `deploy.yml`, `fflow-baseline.yml`, `fflow-approve.yml`          |
| `.github/scripts/`                                         | `example-drift.mjs`, `pack-starter.mjs`, `preview-gate.mjs`, contract publish             |
| `.agents/`                                                 | Flow-rendered agents, rules, skills, hooks and reference                                  |
| `runway.yaml`, `stackra.lock.yaml`, `stackra.starter.yaml` | product and topology, pinned producer manifests, starter profiles                         |

Authoritative documents, in order:

1. `flow.config.json` (`agentsMd.facts`) and `.flow/readme.yml`: the sources of `AGENTS.md` and
   `README.md`. Both of those are rendered by `fflow sync` and are not edited by hand.
2. `docs/template-guide.md`: the full guide (tree, ownership, member kinds, what to replace).
3. Stackra framework ADRs (cited, not copied): https://docs.stackra.figentra.com/adr.
4. `apps/docs/src/docs/adr/index.mdx`: this project's own ADRs (none yet).

## 6. Open risks

- Main CI: green on `12f5b42` (run 42336856556). It failed on 4 pushes between 2026-11-03 and
  2026-11-06 (runs 41695928346, 42118302712, 42119894062, 42254346979) before turning green.
- Open pull requests: 1 besides this one (#43, `figentra/sta-2112-turbo-host`, Quality Gate
  failing).
- Branches other than `main`: 9 (2 `backup/2026-10-30/*`, `refactor/v3-1-lean-starter` 46 ahead and
  40 behind, and 6 `figentra/*` branches; only #43 has an open PR).
- Infisical references: 169 lines in 29 files (`git grep -i -c infisical`). Live ones: `runway.yaml`
  `secrets.infisical` (domain `eu.infisical.com`), `services/example/runway.yaml`, `turbo.jsonc`,
  `.claude/settings.json` permissions and `.agents/rules/secrets.md`. ADR 0525 moves secrets to SOPS
  and the workflows already use SOPS.
- Mintlify references: 118 lines in 25 files (64 in 24 outside `pnpm-lock.yaml`), including the live
  docs target in `runway.yaml`.
- `AGENTS.md` is 85,718 bytes; about 74 KB of it (Grammar to Single owners) is the framework
  programming model and is not specific to this repository. It has two `## This repository` sections
  (lines 62 and 88) that disagree on `apps/console`, and two `## Rules` sections.
- Blocking `@stackra/starter`: the registry needs a trusted publisher row for
  `figentra/stackra-template`, `release.yml`, environment `release`.
