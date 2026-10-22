# Owner review: the Stackra reference template

This file is the one place to review the whole programming model before it is locked. This repository is the
pre-release template, already published as the public GitHub template `figentra/stackra-template`. Nothing is
installed, and every `@stackra/*` import outside this workspace names a package that is not published yet; the
workspace's own packages (`@stackra/loyalty-kit`, `@stackra/access-log`, `@stackra/brand` and the five tooling
presets) are here. Approving the template approves the API it uses. This file is removed before the template is
final.

## What to read, in order (about two hours)

The same order as `README.md` ("Reading order"), with what each step asks you to approve.

| #   | Read                                                                                                                             | What you are approving                                                                                  |
| --- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 1   | The monorepo root (section "Step 1: monorepo root" below)                                                                        | Every root file and folder a real Stackra repo needs, adapted to v2                                     |
| 2   | `AGENTS.md`                                                                                                                      | The glossary of kinds, the renamed terms and the rules every member follows                             |
| 3   | `services/commerce/src/modules/orders/README.md`, then `actions/create-order.action.ts` and `workflows/create-order.workflow.ts` | The service model: decorated actions, models, migrations, policies, events, workflows, seeds, tests     |
| 4   | `services/commerce/src/modules/loyalty/hooks/redeem-points.hook.ts`                                                              | Extending another module through a hook point                                                           |
| 5   | `services/commerce/.stackra/gen/wiring.ts` and `hooks.ts`                                                                        | What gen derives from the declarations                                                                  |
| 6   | `services/notifications/README.md`                                                                                               | Reaching another service (event, call, command); notifications as a service (ADR 0223)                  |
| 7   | `packages/commerce/loyalty-kit/README.md`, `packages/security/access-log/README.md`                                              | A capability kit and a decorator package; packages target realms, not app panels                        |
| 8   | `apps/console/README.md`, then root `runway.yaml` and `apps/console/runway.yaml`                                                 | An app: routes, panels, flags, the generated entry; links point down; infrastructure in the root runway |
| 9   | `apps/docs/src/guides/add-a-field.mdx`                                                                                           | The first change every newcomer makes, from the model to the test                                       |

Then, as time allows: `apps/web/src/` (public site, SEO, PWA, per-tenant brand) and `apps/mobile/src/` (code-based
navigation, tabs declared on routes, offline queue, Arabic plurals).

In each member's `.stackra/` folder, `app-manifest.json` (and a service's `openapi.json`) is committed in a real repo:
it is the contract other members build from. Everything else there (`gen/`, configs, entries, `lang/`) is gitignored in
a real repo and committed here only so you can read the output next to the source.

## Step 1: monorepo root

The root holds what a real Stackra repo root needs, so a project made from this template is complete from its first
commit. It was built from the Stackra repository (`figentra/stackra`, `main`), then cleaned for public use: every repo
operation is a command of the planned `@stackra/cli` (a catalog devDependency), and the product identity is the
neutral example org `acme` (`@acme/*`, `acme.dev`), listed in README "Make it yours". Each repository owns its own
config: nothing here is synced from the Stackra repository. **Copied** = from the Stackra repository unchanged;
**adapted** = copied, then changed to v2 and made generic; **template** = exists only here.

| Item                                                                   | For                                                                                                                                                                                                                                                                                                                                           | Origin                                                                                                                                                                                                                          |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `README.md`                                                            | the one-line model, the tree, which file owns which fact, Make it yours, reading order                                                                                                                                                                                                                                                        | template                                                                                                                                                                                                                        |
| `package.json`                                                         | root scripts: thin calls to `stackra` (`verify`, `validate`, `new`, `gen`, `agents setup` …), turbo (`build`, `typecheck`, `lint`, `test`, `test:coverage`), oxfmt, changesets and gitleaks                                                                                                                                                   | adapted: no `node tools/scripts/*`; `prepare` runs `lefthook install && stackra mcp sync`; `format:check` is `oxfmt --check .`; name `acme-platform`; tooling presets `workspace:*`                                             |
| `pnpm-workspace.yaml`                                                  | members and every version                                                                                                                                                                                                                                                                                                                     | adapted: `release` catalog, knip, coverage, jsdom, `@types/node`; tool versions pinned in this repo's own catalogs                                                                                                              |
| `turbo.jsonc`                                                          | task graph and tier boundaries                                                                                                                                                                                                                                                                                                                | adapted: the template's `gen`-first graph plus remote cache, strict env, `format`, `clean`, `dev`, `test:coverage`                                                                                                              |
| `runway.yaml`, `stackra.lock.yaml`                                     | infrastructure; pinned external producer manifests                                                                                                                                                                                                                                                                                            | template                                                                                                                                                                                                                        |
| `AGENTS.md`, `CLAUDE.md`                                               | this project's facts: glossary, member layout, rules of the model, commands; `CLAUDE.md` is `@AGENTS.md`                                                                                                                                                                                                                                      | adapted: no projected rules block; a Commands section points at `stackra agents setup` and the Stackra MCP                                                                                                                      |
| `.claude/launch.json`                                                  | the assistant preview's dev-server launch configuration (docs on 3333)                                                                                                                                                                                                                                                                        | adapted: `--filter @acme/docs` (no `settings.json`: permissions and hooks are user-level)                                                                                                                                       |
| `.vscode/`, `.markdownlint.yaml`, `cspell.config.yaml`                 | editor setup: oxfmt as the only formatter (whole files on save), oxlint fixes, TypeScript 7 through the TypeScriptTeam.native-preview extension (useTsgo), schema mappings, launch and tasks, spelling                                                                                                                                        | adapted from the Stackra repository's editor setup: no shfmt (no shell scripts here); extensions for docs (markdownlint, Mermaid), i18n Ally, SQLTools + pg, SQLite Viewer, Docker, GitHub Pull Requests and Code Spell Checker |
| `schemas/`                                                             | JSON Schemas for `runway.yaml` (root, app, service), `stackra.lock.yaml`, `.mcp.yaml` and `.github/branch-protection.json`; editors read them by relative path, so they work offline                                                                                                                                                          | copied unchanged from the Stackra repository's `tools/schemas` (`$id` on `static.stackra.figentra.com/schemas/`); temporary copies until that host is live                                                                      |
| `.github/`                                                             | Quality Gate (pre-release: `node .github/scripts/preview-gate.mjs`, commits, format, config parse, secrets; once the CLI ships: `pnpm verify`), release with a lockfile preflight (skips green without `pnpm-lock.yaml`), issue and PR templates, CODEOWNERS, branch protection, `workflows/README.md`, the Stackra brand assets in `assets/` | adapted: no Linear check, no bot token, placeholder team, one required approval                                                                                                                                                 |
| `.changeset/`                                                          | Changesets config and README                                                                                                                                                                                                                                                                                                                  | adapted: `$schema` pinned to the unpkg `@changesets/config@4.0.1` URL; README links made generic                                                                                                                                |
| `.gitignore`, `.gitattributes`                                         | what git never tracks; generated markers                                                                                                                                                                                                                                                                                                      | adapted: `.stackra/*` except the two contracts; `.mcp.json` ignored; `pnpm-lock.yaml` ignored (template only)                                                                                                                   |
| `.oxlintrc.jsonc`, `.oxfmtrc.jsonc`, `knip.jsonc`                      | lint, format, unused-code entries                                                                                                                                                                                                                                                                                                             | adapted: in-repo boundaries preset; generated `.stackra` files are knip entries                                                                                                                                                 |
| `lefthook.yml`, `.commitlintrc.yaml`, `.gitleaks.toml`                 | git hooks, conventional commits, secret scan                                                                                                                                                                                                                                                                                                  | adapted: pre-push runs `stackra gen --check` and `stackra verify --affected`; the issue-key rule is off until you set it                                                                                                        |
| `mise.toml`, `.node-version`, `.editorconfig`                          | toolchain pins, editor contract                                                                                                                                                                                                                                                                                                               | `mise.toml` adapted (no AWS profile, no spec-kit); others copied (`.editorconfig` has no shfmt section: no shell scripts here)                                                                                                  |
| `.mcp.yaml`                                                            | every MCP server the stack uses: the Stackra MCP (local, and hosted at `mcp.stackra.figentra.com`), docs servers and the tool servers (24 in all)                                                                                                                                                                                             | adapted: token servers run through `stackra mcp exec` with `$VAR` references; npx servers pinned; `vellum-mcp` and the Encore CLI need separate installs; `.mcp.json` is rendered by `stackra mcp sync` and gitignored          |
| `CONTRIBUTING.md`, `SECURITY.md`, `LICENSE`, `NOTICE`, `TRADEMARKS.md` | contributor steps, disclosure policy, MIT, licence exclusions, trademark terms for the bundled Stackra brand assets                                                                                                                                                                                                                           | adapted (placeholder security contact, no tracker key); `LICENSE` copied, holder Figentra Technologies L.L.C.; `TRADEMARKS.md` covers only the Stackra assets, your code stays yours                                            |
| member files                                                           | every member has `README.md`, `AGENTS.md` (with a `## PII` table) and `CHANGELOG.md`; libraries and tooling carry a byte-identical `LICENSE`; apps and services are `UNLICENSED` with none                                                                                                                                                    | adapted from the Stackra repository's member rules (ADR 0195)                                                                                                                                                                   |
| `packages/tooling/{typescript,oxlint,vitest,tsdown,commitlint}`        | tier:config presets every member extends                                                                                                                                                                                                                                                                                                      | adapted: presets imported by file name (`service.json` added), decorators on in library/app/expo, v2 boundaries; vitest adds the four member factories; commitlint copied, issue prefix made `PROJ`                             |

**Moved into `@stackra/cli`** (not in the template; the template cannot run them until the CLI exists):

| Stackra repository                                                                                                                                                                           | CLI command                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `tools/scripts/validate-repository.mjs`, `doc-standard.mjs`, `jsonc.mjs` (the JSONC reader both need)                                                                                        | `stackra validate` (also inside `stackra verify`)                                                           |
| `tools/scripts/structure.mjs`                                                                                                                                                                | `stackra structure` (the kind table; appendix below)                                                        |
| `tools/scripts/scaffold.mjs`, `tools/scaffold/templates`                                                                                                                                     | `stackra new <kind> <name>` (member shapes; appendix below)                                                 |
| `tools/scripts/agents-sync.mjs` (`.mcp.json` part)                                                                                                                                           | `stackra mcp sync`                                                                                          |
| `tools/scripts/doctor.mjs` (generic checks only)                                                                                                                                             | `stackra doctor`                                                                                            |
| the `verify` chain: `format:check`, turbo `lint typecheck test build`, `validate` (which runs doc-standard, spec-gate and spec-trace, `test:hooks` and `agents:check`), `boundaries`, `knip` | `stackra verify`, plus a gen check (new in v2); spec-gate, spec-trace and `test:hooks` are not carried over |
| `tools/scripts/__tests__/`, `tools/scripts/README.md`                                                                                                                                        | the CLI's own tests and docs                                                                                |

**Moved to `@stackra/skills`** (installed per machine by `stackra agents setup`: Claude Code plugin marketplace,
OpenCode or Kiro global config) and the hosted Stackra MCP: `.agents/` (rules rewritten to v2, 23 agents, the
repo-owned and vendored skills, `models.yaml`, the fenced Encore reference), the guard hooks (`stackra hooks
guard-bash|guard-paths|session-context|prompt-hints|post-write-checks`), `.claude/agents|skills|commands|hooks` and
`.claude/README.md`, the Claude settings (permissions and hook wiring), `.opencode/` (with its `plugins/`) and
`opencode.jsonc`. The adapted sources are kept outside this repository as the seed of `@stackra/skills`, and the v2
drafts of the removed scripts as the seed of the CLI.

Not copied, on purpose:

- Figentra operations: `linear.mjs`, `linear-reconcile.mjs` and the Linear sync workflow, `bot-gh.mjs`/`bot-token.mjs`
  (`bot:gh|git|review`), `pr-merge.mjs`, `delegate.mjs` and `.agents/routing.yaml`, `ai-spend.mjs`,
  `secrets-import.mjs` and the `secret-manager` agent, `mcp.sh` (vault wrapper), the Linear rule, and
  `workers/static` with `.github/workflows/deploy-static.yml` (the Worker that serves `static.stackra.figentra.com`,
  the host of the schema `$id`s).
- spec-kit (`.specify/`, `.agents/speckit/`, `.agents/specs/`, the `speckit-*` skills and commands, `spec-gate`,
  `spec-trace`, `spec-linear`, `spec-parse.mjs`, `speckit-sync.mjs`, the `spec-writer` agent and `docs-spec-flow`
  skill): every artefact is keyed to Linear issues and the framework's SDLC lanes. See the Vellum item under
  "Decided by default".
- `.notes/` and `.gitmodules` (private notes), `.infisical.yaml` (workspace id), `.github/NOTICE` (the framework's
  licence-exclusion notice), the pending framework changesets. The template keeps the Stackra brand assets it
  shows: `.github/assets/brand/` (README logo), `.github/assets/social-preview.png`, both covered by
  `.github/assets/NOTICE` and `TRADEMARKS.md`.
- `pnpm-lock.yaml`, `node_modules/`, `.turbo/`, `.cache/`, `.DS_Store`, `.claude/settings.local.json`, worktrees:
  install, build, machine and per-user output.

## Changed in the template since 2026-10-21

- #1: `.github/README.md` removed, so GitHub shows the root README.
- #2: `.mcp.yaml` lists all 24 servers (Stackra local and hosted, Vellum, Encore local and cloud, Context7, Mintlify,
  four HeroUI, Uniwind, Expo, Figma, GitHub, Linear, Cloudflare docs and API, AWS knowledge, Stripe, Resend docs,
  Sentry, PostHog, Playwright); token servers run through `stackra mcp exec --` with `$VAR` references.
- #3: a Quality Gate that needs no workspace install.
- #4: the `@stackra/commitlint-config` preset and a two-line `.commitlintrc.yaml`; every repo YAML block style;
  `apps/web` uses `Target.Web` + `Target.Pwa` with `render: RenderMode.Server`; `.vscode/` and `cspell.config.yaml`.
- #5: editor extensions for docs, i18n, data, Docker and pull-request review; `js/ts.*` settings keys; trusted schema
  hosts; `pnpm-lock.yaml` removed and gitignored.
- #6: every member's `imports` map has `#src/*` and `#stackra/*`; code aliases are four-target arrays, so TypeScript 7
  bundler resolution finds the 1401 extensionless imports (0 unresolved under tsgo 7.0.2); `#assets/*` stays a string.
- #7: the endorsed Stackra logo in the README, brand-colour badges, the rebuilt social preview, `TRADEMARKS.md` and
  `.github/assets/NOTICE`, the Acme mark as the mobile logo.
- #8: `schemas/` (six JSON Schemas, draft 2020-12) and a `$schema` line or editor mapping for every config file;
  electron-builder `arch` moved inside each target.
- #9: one `preview-gate.mjs` for CI and agents (pinned npx versions, 30 s fetch timeout, 3 retries, 15 min job
  limit); a release `preflight` job that skips green while no `pnpm-lock.yaml` is committed; contract headers on the
  workflows.
- #10: oxfmt formats every type it supports, whole files only (`formatOnSaveMode: file`); lefthook checks the same
  globs; `format:check` is `oxfmt --check .`; CONTRIBUTING "Formatting".
- This PR: Figentra Technologies L.L.C. everywhere; the hosted MCP at `mcp.stackra.figentra.com`; the vitest member
  factories (`nodePreset`, `libraryPreset`, `reactPreset`, `nativePreset`) and the coverage gate wired; member
  `AGENTS.md`, `CHANGELOG.md` and `LICENSE` files and library manifest fields; the Acme brand kept blue and separate
  from the trademarked Stackra assets; editor, spelling and Markdown fixes; this file rewritten for public readers.

## Decided since you last looked (2026-10-21)

- Decorators everywhere; Stackra `define*` only in `stackra.config.ts` (third-party tool configs keep their own
  `defineConfig`). Drivers self-register (`@Driver`, `@DriverOf`, `@Replaces`).
- ADR 0223: no `@stackra/forms` (forms use `@stackra/ui/form`), no `@stackra/notifications` package (it is a service, ADR 0223).
- pwa and network fold into `@stackra/platform`; router folds into `@stackra/navigation`; no templates package.
- Navigation links point down only: a route may reference its layout and page by class; layouts, menus and pages refer
  to routes by generated keys (`Routes.dashboard`). Tabs and menus are generated from the routes.
- `@Flag` lives in `@stackra/feature-flags`; the model money column is `@MoneyColumn`; `Money` is the value class.
- Test files may import a sibling module's factories and models.
- Inbound-email cancel ships with its three safeguards (signed webhook, DKIM/SPF plus verified email, judged as the customer).
- Builder architecture (ADR 0270) and saved views (ADR 0271) are merged; the template does not build an editor yet.

## Decided 2026-10-22

- **Domain:** hosted Stackra services live under `stackra.figentra.com`. Static files, including the JSON Schemas under
  `/schemas/`, are served from `static.stackra.figentra.com` by the `workers/static` Worker in the Stackra
  repository; the hosted MCP is `mcp.stackra.figentra.com`. No `stackra.dev` anywhere.
- **Legal entity:** Figentra Technologies L.L.C. in `LICENSE` (and every package copy), `NOTICE`, `TRADEMARKS.md` and
  `.github/assets/NOTICE`.
- **Editor:** TypeScript 7 runs through the TypeScript 7 VS Code extension (`TypeScriptTeam.native-preview`,
  `js/ts.experimental.useTsgo: true`, no `js/ts.tsdk.path`); oxfmt formats every supported type as whole files
  (`formatOnSaveMode: file`); TOML goes to oxc, and Even Better TOML only validates.
- **Config ownership:** each repository owns its own config, with no shared or synced files; the new-repo checklist in
  the Stackra tracker is the shared standard.
- **Brand split:** the Acme example brand (blue accent, Acme placeholders) is the user's product brand; only the
  bundled Stackra assets in `.github/assets/` are trademarked.
- **Public template:** the repository is public. `.github/assets/social-preview.png` is uploaded by hand in
  Settings > Social preview; a repository made from the template does not inherit it.
- **Review and merge:** template pull requests are reviewed only by the `stackra-reviewer` identity and merged only
  with `pnpm pr:merge`. CONTRIBUTING.md's "a reviewer other than the author approves" is the rule for generated
  projects.

## Decided by default — please confirm

- **Packages target realms, not app panels.** A package's resources, widgets, settings pages and documents declare
  `realms: [Realm.TenantAdmin]` (`Realm` from `@stackra/contracts`); each app panel declares the realms it hosts
  (`@Panel({ key, realms: [...] })`), and gen places package contributions into every panel hosting their realm.
- **Console reaches HeroUI Pro only through `@stackra-pro/ui`** (ADR 0113), never `@heroui-pro/react` directly.
- **`renderRoute` takes a route key** (`renderRoute(Routes.inbox, …)`), like every other navigation API.
- **Workflows:** the decorator is `@Workflow()` on a class that `extends WorkflowBase` (the base class no longer shares
  the decorator's name).
- **Closed sets are enums** everywhere, including `Idempotency.Required`, `MigrationMode.ForwardOnly`,
  `MigrationRunner.Auto`, `Tone.Danger` and `SessionStatus.SignedIn`.
- **Spec workflow:** spec-kit is not shipped; `.mcp.yaml` lists the Vellum spec-status MCP (`vellum-mcp`, not a
  dependency yet). Keep Vellum, or remove it along with spec-kit?

## Known limits (pre-release)

- CI and `node .github/scripts/preview-gate.mjs [commits|format|config|secrets]` check commit messages
  (`@commitlint/config-conventional`, not the house preset, which needs an install), oxfmt formatting, that every
  tracked YAML and JSON file parses, and gitleaks. Catalog and import resolution (tsgo 7.0.2: 0 unresolved, #6), wire
  keys against manifests, i18n key parity and the navigation zero-cycle scan were run once by hand and are not in the
  repo. No member typecheck or tests run until the packages exist; the `@stackra/vitest-config` tests and typecheck
  pass under vitest 5.0.5 and tsgo 7.0.2 in a scratch install.
- `pnpm install` cannot run (`prepare` calls `stackra`, and `@stackra/*` is unpublished), so `pnpm verify`, the
  lefthook hooks and `stackra agents setup` cannot run either. `node .github/scripts/preview-gate.mjs` runs the
  install-free checks locally, exactly as CI does.
- Template only, removed in a real project once `@stackra/*` is published: the `pnpm-lock.yaml` line in `.gitignore`,
  `!.stackra/**` in the root and member `.gitignore` files with the committed `.stackra` samples, the pre-release
  step in `ci.yml` with `.github/scripts/preview-gate.mjs`, and this file.
- `schemas/` holds copies until `static.stackra.figentra.com/schemas/` is live (it does not resolve yet); then the
  `$schema` lines and editor mappings point at the hosted URLs and the folder goes.
- The live repository uses rulesets (`main`: squash only, Quality Gate required, 0 approvals, since reviews come from
  `stackra-reviewer` and merges from `pnpm pr:merge`; plus `release-tags`) and CodeQL default setup. A project made
  from the template applies `.github/branch-protection.json` (one approval) and enables CodeQL itself.
- A few API shapes are assumed: `eventRef(…, { channel })`, `Page(View, { unread })`, `upload(…, { label })`,
  `ctx.captcha`.
- Language files for producers outside this repo (`queue`, `settings`, `experience`, `theming`, `leads`) hold only
  the keys the apps use, with placeholder Arabic and English text.

## How to give feedback

Write comments anywhere (in chat, or as `// OWNER:` lines in the files). Each comment becomes either a fix in the
template or a decision recorded in an ADR. When you approve, the template becomes the golden reference for the members
of the Stackra repository and the plan locks.

## Appendix: what `@stackra/cli` must carry

Kept here so the work done on the removed `tools/` is not lost (a draft of the v2 scripts sits outside the repo; ask
for it when the CLI is built).

### `stackra structure`: kind → folder → required test

Tests: unit `.test`, int `.int.test`, contract `.contract.test`, load `.load.test`, e2e `.e2e.test` (in
`apps/<app>/src/routes/__tests__/`), flow `.flow.yaml` (Maestro). "—" = covered by another kind's test.

| Suffix                                                | Folder                                                                                  | Test     |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------- | -------- |
| action, query                                         | actions, queries                                                                        | unit     |
| model, state                                          | models, states                                                                          | —        |
| migration                                             | migrations (`<nnnn>-<name>`)                                                            | —        |
| factory, seed, repository                             | factories (packages: `testing/factories`), seeds, repositories (optional)               | —        |
| policy, guard                                         | policies, guards                                                                        | unit     |
| permission                                            | permissions                                                                             | contract |
| entitlement                                           | entitlements                                                                            | —        |
| event, upcast, change                                 | events, versions, versions (an app's `analytics/<name>.event.ts` is an analytics event) | contract |
| listener                                              | listeners                                                                               | unit     |
| hook-point, hook                                      | hooks                                                                                   | —, unit  |
| workflow                                              | workflows                                                                               | int      |
| service                                               | services                                                                                | unit     |
| setting, flag                                         | settings (an app's own flags: `src/flags/`)                                             | —        |
| config, port                                          | config, contracts                                                                       | —        |
| driver                                                | drivers                                                                                 | int      |
| link, search                                          | links, search                                                                           | —        |
| resource, widget, document                            | resources, widgets, documents                                                           | contract |
| point, override(.tsx)                                 | override-points, `overrides/<module>/components`                                        | —        |
| mail(.tsx)                                            | mails                                                                                   | —        |
| facts, skill, prompt                                  | ai                                                                                      | —        |
| integration, connection, bucket                       | integrations, connections, buckets                                                      | —        |
| webhook                                               | webhooks                                                                                | unit     |
| route, layout                                         | routes                                                                                  | unit, —  |
| panel                                                 | panels (they host realms)                                                               | —        |
| menu, command                                         | menus, commands                                                                         | unit     |
| block                                                 | `blocks/<name>/` (a folder per block)                                                   | unit     |
| bridge, store                                         | bridges, stores                                                                         | unit     |
| provider, context(.tsx)                               | `providers/<name>/`                                                                     | unit, —  |
| schema, enum, error                                   | schemas, enums, errors                                                                  | —        |
| interface, type, function, constant, token, decorator | interfaces, types, functions, constants, tokens, decorators                             | —        |
| explorer                                              | `node/` (`node/<pkg>.explorer.ts`)                                                      | unit     |
| matcher, fake                                         | matchers, fakes                                                                         | unit, —  |
| server, client                                        | server, (none)                                                                          | unit, —  |
| extend                                                | member root (`vite`/`metro`/`electron.extend.ts`)                                       | —        |

Specials: a root module `<name>.module.ts` has an int boot test; an app root `src/<key>.app.ts` has a unit test; a
React hook `use-*.ts` sits beside its component or in an app's `hooks/`. Member layout:
`services/<n>/src/modules/<key>/<kind>/`; `packages/<c>/<n>/src/node/<kind>/` plus `src/{core,react,testing}/<kind>/`,
`src/config/`, `src/contracts/`; `apps/<n>/src/<kind>/`. Member root: `assets/` (`lang/<locale>/<ns>.json`, `public`,
`ai`) and `.stackra/`. Banned folders: `features`, `utils`, `helpers`, `dtos`, `controllers`, `screens`; `pages` in a
service. Package entries: `.` = `src/index.ts`, then `contracts`, `node`, `react`, `native`, `testing`, and `devtools`
when there is real code for it. Categories: the twelve of the Stackra repository.

### `stackra validate`: checks beyond the Stackra repository's

- `stackra.config.ts` default-exports `defineApp`/`defineService`, its key and module exist, and the module ends
  `.module.ts` (service) or `.app.ts` (app); `runway.yaml` `member` equals the config key.
- A service's `src/main.ts` is `createApp(Root, { wiring })`; an app has no authored `src/main` or `src/index`.
- A package has no `runway.yaml` or `stackra.config.ts`; its code exports point at `./src` (assets and CSS files are
  exported as files), and `publishConfig.exports` has the same keys with `{ types: dist/*.d.mts, import:
dist/*.mjs }`, access public, provenance on.
- Banned folders; Stackra `define*` outside `stackra.config.ts`; a tsconfig preset typescript-config exports.
- `.stackra/` commits only `app-manifest.json` and `openapi.json` unless the root `.gitignore` opts in (the template).
- Forbidden dependencies add `@stackra/forms`, `notifications`, `router`, `pwa`, `network`, `templates`.
- A generated migration may open with `// generated by stackra db diff` or a `/** generated by … */` block.

### `stackra new`: member shapes

New `{{KEY}}` token = the name in snake_case; dev ports go into `runway.yaml`. Every member's `imports` map has
`#src/*` and `#stackra/*`; a code alias is a four-target array (`./dir/*`, `./dir/*.ts`, `./dir/*.tsx`,
`./dir/*/index.ts`) so TypeScript 7 bundler resolution finds extensionless imports, and `#assets/*` stays a string.

- **service**: package.json (gen, dev, typecheck, lint, format:check, test, build; `#src #modules #config #assets
#stackra` imports; `./contracts` export), `stackra.config.ts` (`defineService`: key, module, area, health,
  migrations), `runway.yaml`, tier:service, `service.json` preset, `.gitignore`, README, `src/main.ts`, root module,
  `src/modules/README.md`, `src/config/<n>.config.ts`, `src/contracts/index.ts`, the boot test.
- **package**: `src/index.ts`, `src/node/{index.ts, <n>.module.ts, __tests__/}`; optional entries in `src/<e>/index.ts`;
  exports, publishConfig, `#` imports and `stackra.module` written; tier:lib.
- **tooling**: a preset package in `packages/tooling/<n>`.
- **app:console**: `defineApp` (web, pwa; desktop = `Target.Desktop` + `src/config/desktop.config.ts` + `src/bridges/`),
  `@App`, one panel (`Realm.TenantAdmin`), a route and a layout, a page component, env config, styles, lang, runway,
  the app test; no authored entry.
- **app:web**: `Target.Web` and `Target.Pwa` with `render: RenderMode.Server`, a site layout and a prerendered landing route, page component, env, styles, lang.
- **app:mobile**: no hyphen in the name; ios and android, a tabs layout (native tabs), a home route with `tab`, React
  Navigation (no expo-router), `EXPO_PUBLIC_` env, `native.css` brand, runway `metroPort`.
- **app:docs**: Mintlify `src/` (docs.json, pages, assets), `runway.yaml`; no `stackra.config.ts` or tsconfig.
- `app:desktop` is gone: desktop is a target of a console app.
