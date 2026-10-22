# Owner review: the Stackra reference template

This folder is the one place to review the whole programming model before it is locked. It is a preview, not a
working repo: nothing is installed, and every `@stackra/*` import names a package that does not exist yet. Each name it
uses is listed in the API contract (`api-surface.md` in the owner's notes), so approving the template approves that
contract too.

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
a real repo and shown here only so you can read the output next to the source.

## Step 1: monorepo root

The root holds what a real Stackra repo root needs, so a project made from this template (to be published as the
public GitHub template `figentra/stackra-template`) is complete from its first commit. It was built from the real
repository (`final-project`, `main`), then cleaned for public use: every repo operation is a command of the planned
`@stackra/cli` (a catalog devDependency), and every Figentra-only value is gone: the product identity is the neutral example org `acme`
(`@acme/*`, `acme.dev`), listed in README "Make it yours". **Copied** = from the real repo unchanged; **adapted** = copied, then changed to v2 and made generic;
**template** = exists only here.

| Item                                                                   | For                                                                                                                                  | Origin                                                                                                                                          |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json`                                                         | root scripts, all thin calls: `stackra verify`, `validate`, `new`, `gen`, `agents setup` …                                           | adapted: no `node tools/scripts/*`; `prepare` runs `lefthook install && stackra mcp sync`; `agents:setup`; tooling presets `workspace:*`        |
| `pnpm-workspace.yaml`                                                  | members and every version                                                                                                            | adapted: `release` catalog, knip, coverage, `@types/node`; tool versions aligned with the real repo                                             |
| `turbo.jsonc`                                                          | task graph and tier boundaries                                                                                                       | adapted: the template's `gen`-first graph plus remote cache, strict env, `format`, `clean`, `dev`, `test:coverage`                              |
| `runway.yaml`, `stackra.lock.yaml`                                     | infrastructure; pinned external producer manifests                                                                                   | template                                                                                                                                        |
| `AGENTS.md`, `CLAUDE.md`                                               | this project's facts: glossary, member layout, rules of the model, commands; `CLAUDE.md` is `@AGENTS.md`                             | adapted: no projected rules block; a Commands section points at `stackra agents setup` and the Stackra MCP                                      |
| `.claude/launch.json`                                                  | the assistant preview's dev-server launch configuration (docs on 3333)                                                               | copied (no `settings.json`: permissions and hooks are user-level)                                                                               |
| `.vscode/`, `.markdownlint.yaml`, `cspell.config.yaml`                 | repo-level editor setup: settings (oxfmt as the only formatter, schema mappings), recommended extensions, launch and tasks, spelling | template; shared by everyone who opens the repo                                                                                                 |
| `.github/`                                                             | Quality Gate (`pnpm verify`, commitlint, secret scan), release, issue and PR templates, CODEOWNERS, branch protection                | adapted: no Linear check, no bot token, placeholder team, one required approval                                                                 |
| `.changeset/`                                                          | Changesets config and README                                                                                                         | copied (README links made generic)                                                                                                              |
| `.gitignore`, `.gitattributes`                                         | what git never tracks; generated markers                                                                                             | adapted: `.stackra/*` except the two contracts; `.mcp.json` ignored                                                                             |
| `.oxlintrc.jsonc`, `.oxfmtrc.jsonc`, `knip.jsonc`                      | lint, format, unused-code entries                                                                                                    | adapted: in-repo boundaries preset; generated `.stackra` files are knip entries                                                                 |
| `lefthook.yml`, `.commitlintrc.yaml`, `.gitleaks.toml`                 | git hooks, conventional commits, secret scan                                                                                         | adapted: pre-push runs `stackra gen --check` and `stackra verify --affected`; the issue-key rule is off until you set it                        |
| `mise.toml`, `.node-version`, `.editorconfig`                          | toolchain pins, editor contract                                                                                                      | `mise.toml` adapted (no AWS profile, no spec-kit); others copied                                                                                |
| `.mcp.yaml`                                                            | every MCP server the stack uses: the Stackra MCP (local and hosted), docs servers and the tool servers (24 in all)                   | adapted: token servers run through `stackra mcp exec` with `$VAR` references; `.mcp.json` is rendered by `stackra mcp sync` and gitignored      |
| `CONTRIBUTING.md`, `SECURITY.md`, `LICENSE`, `NOTICE`, `TRADEMARKS.md` | contributor steps, disclosure policy, MIT, licence exclusions, trademark terms for the bundled Stackra brand assets                  | adapted (placeholder security contact, no tracker key); `LICENSE` copied; `TRADEMARKS.md` covers only the Stackra assets, your code stays yours |
| `packages/tooling/{typescript,oxlint,vitest,tsdown}`                   | tier:config presets every member extends                                                                                             | adapted: presets imported by file name (`service.json` added), decorators on in library/app/expo, v2 boundaries                                 |

**Moved into `@stackra/cli`** (not in the template; the preview cannot run them until the CLI exists):

| Real repo                                                                             | CLI command                                                 |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `tools/scripts/validate-repository.mjs`, `doc-standard.mjs`                           | `stackra validate` (also inside `stackra verify`)           |
| `tools/scripts/structure.mjs`                                                         | `stackra structure` (the kind table; appendix below)        |
| `tools/scripts/scaffold.mjs`, `tools/scaffold/templates`                              | `stackra new <kind> <name>` (member shapes; appendix below) |
| `tools/scripts/agents-sync.mjs` (`.mcp.json` part)                                    | `stackra mcp sync`                                          |
| `tools/scripts/doctor.mjs` (generic checks only)                                      | `stackra doctor`                                            |
| the `verify` chain (turbo tasks, gen check, validate, boundaries, knip, agents check) | `stackra verify`                                            |

**Moved to `@stackra/skills`** (installed per machine by `stackra agents setup`: Claude Code plugin marketplace,
OpenCode or Kiro global config) and the hosted Stackra MCP: `.agents/` (rules rewritten to v2, 23 agents, the
repo-owned and vendored skills, `models.yaml`, the fenced Encore reference), the guard hooks (`stackra hooks
guard-bash|guard-paths|session-context|prompt-hints|post-write-checks`), `.claude/agents|skills|commands`, the Claude
settings (permissions and hook wiring), `.opencode/` and `opencode.jsonc`. The adapted sources are kept outside the
repo as the seed of `@stackra/skills` (`stackra-notes/skills-draft/`, with the last rules block in
`AGENTS.rules-block.md`); the v2 drafts of the removed scripts are in `stackra-notes/cli-draft/tools/`.

Not copied, on purpose:

- Figentra operations: `linear.mjs`, `linear-reconcile.mjs` and the Linear sync workflow, `bot-gh.mjs`/`bot-token.mjs`
  (`bot:gh|git|review`), `pr-merge.mjs`, `delegate.mjs` and `.agents/routing.yaml`, `ai-spend.mjs`,
  `secrets-import.mjs` and the `secret-manager` agent, `mcp.sh` (vault wrapper), the Linear rule.
- spec-kit (`.specify/`, `.agents/speckit/`, `.agents/specs/`, the `speckit-*` skills and commands, `spec-gate`,
  `spec-trace`, `spec-linear`, the `spec-writer` agent and `docs-spec-flow` skill): every artefact is keyed to Linear
  issues and the framework's SDLC lanes. Owner decision below.
- `.notes/` and `.gitmodules` (private notes), `.infisical.yaml` (workspace id), `.github/NOTICE` (the framework's
  licence-exclusion notice), the pending framework changesets. The template keeps the Stackra brand assets it
  shows: `.github/assets/brand/` (README logo), `.github/assets/social-preview.png`, both covered by
  `.github/assets/NOTICE` and `TRADEMARKS.md`.
- `pnpm-lock.yaml`, `node_modules/`, `.turbo/`, `.cache/`, `.DS_Store`, `.claude/settings.local.json`, worktrees:
  install, build, machine and per-user output.

## Decided since you last looked (2026-10-21)

- Decorators everywhere; `define*` only in `stackra.config.ts`. Drivers self-register (`@Driver`, `@DriverOf`, `@Replaces`).
- ADR 0223: no `@stackra/forms` (forms use `@stackra/ui/form`), no `@stackra/notifications` package (it is a service, ADR 0223).
- pwa and network fold into `@stackra/platform`; router folds into `@stackra/navigation`; no templates package.
- Navigation links point down only: a route may reference its layout and page by class; layouts, menus and pages refer
  to routes by generated keys (`Routes.dashboard`). Tabs and menus are generated from the routes.
- `@Flag` lives in `@stackra/feature-flags`; the model money column is `@MoneyColumn`; `Money` is the value class.
- Test files may import a sibling module's factories and models.
- Inbound-email cancel ships with its three safeguards (signed webhook, DKIM/SPF plus verified email, judged as the customer).
- Builder architecture (ADR 0270) and saved views (ADR 0271) are merged; the template does not build an editor yet.

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

## Known limits of the preview

- Static checks only: formatting, JSON, catalog and import resolution, wire keys against manifests, i18n key parity,
  and a zero-cycle scan of the navigation imports. No typecheck or tests run until the packages exist.
- A few API shapes are assumed and listed in the contract: `eventRef(…, { channel })`, `Page(View, { unread })`,
  `upload(…, { label })`, `ctx.captcha`.
- Language files for producers outside this repo (`queue`, `settings`, `experience`, `theming`, `leads`) hold only
  the keys the apps use, with placeholder Arabic and English text.
- Every root script calls `stackra`, which does not exist yet: `pnpm install`, `pnpm verify`, the git hooks and
  `stackra agents setup` cannot run in the preview. That is accepted for review; the appendix is
  what the CLI must carry.

## How to give feedback

Write comments anywhere (in chat, or as `// OWNER:` lines in the files). Each comment becomes either a fix in the
template or a decision recorded in an ADR. When you approve, the template becomes the golden reference members in the
repo (STA-223) and the plan locks.

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
service. Package entries: `.` = `src/index.ts`, then `contracts`, `node`, `react`, `native`, `testing`. Categories: the
twelve of the real repo.

### `stackra validate`: checks beyond the real repo's

- `stackra.config.ts` default-exports `defineApp`/`defineService`, its key and module exist, and the module ends
  `.module.ts` (service) or `.app.ts` (app); `runway.yaml` `member` equals the config key.
- A service's `src/main.ts` is `createApp(Root, { wiring })`; an app has no authored `src/main` or `src/index`.
- A package has no `runway.yaml` or `stackra.config.ts`; its `exports` point at `./src` and `publishConfig.exports`
  has the same keys with `{ types: dist/*.d.mts, import: dist/*.mjs }`, access public, provenance on.
- Banned folders; `define*` outside `stackra.config.ts`; a tsconfig preset typescript-config exports.
- `.stackra/` commits only `app-manifest.json` and `openapi.json` unless the root `.gitignore` opts in (the preview).
- Forbidden dependencies add `@stackra/forms`, `notifications`, `router`, `pwa`, `network`, `templates`.
- A generated migration may open with `// generated by stackra db diff` or a `/** generated by … */` block.

Defects this draft found in the template: no `description` in `apps/mobile`, `services/commerce` and
`services/notifications` `package.json`; no `packages/cross-cutting/brand/assets/NOTICE`.

### `stackra new`: member shapes

New `{{KEY}}` token = the name in snake_case; dev ports go into `runway.yaml`.

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
