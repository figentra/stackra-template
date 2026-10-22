<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/brand/stackra-endorsed-en-dark.svg" />
    <img src=".github/assets/brand/stackra-endorsed-en-light.svg" alt="stackra, by figentra" height="48" />
  </picture>
</p>

<p align="center">
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-F8BD40.svg"></a>
  <a href="https://github.com/figentra/stackra-template/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/figentra/stackra-template/actions/workflows/ci.yml/badge.svg"></a>
  <a href=".node-version"><img alt="Node 24" src="https://img.shields.io/badge/node-24-0B0D0F.svg?logo=node.js&logoColor=white"></a>
  <a href="https://pnpm.io"><img alt="pnpm 12" src="https://img.shields.io/badge/pnpm-12-0B0D0F.svg?logo=pnpm&logoColor=white"></a>
  <a href="https://www.typescriptlang.org"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-0B0D0F.svg?logo=typescript&logoColor=white"></a>
  <a href="https://turborepo.com"><img alt="Turborepo" src="https://img.shields.io/badge/Turborepo-monorepo-0B0D0F.svg?logo=turborepo&logoColor=white"></a>
  <a href="https://www.conventionalcommits.org"><img alt="Conventional Commits" src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-0B0D0F.svg?logo=conventionalcommits&logoColor=white"></a>
  <a href="CONTRIBUTING.md"><img alt="PRs welcome" src="https://img.shields.io/badge/PRs-welcome-1F7A3A.svg"></a>
</p>

# Stackra monorepo template

Stackra is a TypeScript framework for products that ship one backend to many surfaces. You declare
behaviour as decorated classes (actions, queries, models, events, routes) and `stackra gen` derives
the rest: the dependency wiring, the HTTP and MCP endpoints, typed clients for every consumer, the
app entries and the runtime config for web, PWA, desktop and mobile. This repository is the
reference monorepo that `pnpm create stackra` will render: two services, three apps, three packages,
five tooling presets and the docs site, each showing every file kind with its test. The example
product is **Acme**, a multi-tenant commerce platform: a staff console, a public storefront, a
mobile app, and the commerce and notifications services behind them.

> [!NOTE] **Pre-release.** The `@stackra/*` packages and the `stackra` CLI are not published yet.
> Nothing here installs or compiles today; the template exists so humans and agents can read a
> complete project end to end and review the programming model before the first release. Generated
> output under `.stackra/` is committed only so it can be read next to its source (see
> `.gitignore`).

## Quick start

1. Click **Use this template** on GitHub, then clone your new repository. Once the CLI is published,
   `pnpm create stackra my-app` renders the same shape.
2. Run:

   ```sh
   mise install                 # node, pnpm, gitleaks, infisical, maestro, encore, eas-cli, pinned
   pnpm install                 # dependencies, git hooks (lefthook) and .mcp.json (`stackra mcp sync`)
   stackra agents setup         # once per machine: Stackra skills, sub-agents and guard hooks for your assistant
   pnpm gen && pnpm dev         # generate .stackra/ and run every member
   pnpm verify                  # the gate CI runs
   ```

3. Replace the example identity, see [Make it yours](#make-it-yours).

## Structure

| Path                               | What it holds                                                                |
| ---------------------------------- | ---------------------------------------------------------------------------- |
| `services/commerce`                | the reference service: catalogue, inventory, orders and loyalty modules      |
| `services/notifications`           | a consumer service: reaches commerce by event, call and command, never code  |
| `apps/console`                     | tenant console: web, PWA and desktop (Electron) from one source tree         |
| `apps/web`                         | public site and storefront: server-rendered on Workers, installable as a PWA |
| `apps/mobile`                      | Expo app for iOS and Android                                                 |
| `apps/docs`                        | Mintlify docs: guides, ADRs and the API reference generated from manifests   |
| `packages/commerce/loyalty-kit`    | a feature package: every kind a package can hold                             |
| `packages/security/access-log`     | a decorator package: `@AccessLogged` with its explorer                       |
| `packages/cross-cutting/brand`     | brand tokens as TypeScript, CSS and native CSS                               |
| `packages/tooling/*`               | TypeScript, oxlint, Vitest, tsdown and commitlint presets                    |
| `runway.yaml`, `stackra.lock.yaml` | infrastructure and environments; pinned external producer manifests          |

The full annotated tree is in [Tree](#tree) below.

## The programming model in one screen

An **action** is the only unit of behaviour. One declaration becomes an HTTP endpoint, an MCP tool,
a typed client method and a permission:

```ts
@Action({
  key: "order.cancel",
  input: CancelOrderInput,
  output: CancelOrderOutput,
  permission: OrderPermissions.cancel,
  actors: [ActorKind.User, ActorKind.Agent, ActorKind.Service],
})
@AsEndpoint({ method: HttpMethod.Put, path: "/orders/:orderId/cancel" })
@AsTool()
export class CancelOrderAction {
  constructor(private readonly orders: OrderService) {}

  async handle(input: CancelOrderInput, ctx: ActionContext): Promise<CancelOrderOutput> {
    const order = await this.orders.findOneOrFail({ id: input.orderId });
    await ctx.authorize(OrderPermissions.cancel, order);
    await this.orders.cancel(order, CancelReason.Staff);
    return { orderId: order.id, status: order.status.value };
  }
}
```

A **model** is a class; traits add the public id, tenancy, timestamps and optimistic locking:

```ts
@Model()
@Index(["tenantId", "status", "createdAt"])
export class Order extends Model.with(HasPublicId("ord"), BelongsToTenant, Timestamps, Versioned) {
  @Str({ max: 64 }) customerId!: string;
  @HasState(OrderState) status!: OrderState;
  @MoneyColumn({ currencyField: "currency" }) totalMinor!: number;
  @HasMany(() => OrderLine, (line) => line.order) lines!: OrderLine[];
}
```

A **route** names its path, layout and component, and submits to an action through the generated
client:

```ts
@Route({
  path: "/quick-order",
  layout: ShellLayout,
  component: QuickOrderPage,
  flag: Flags.orders.quick_order,
  submits: { action: Commerce.actions.CreateOrder, form: QuickOrderForm },
})
export class QuickOrderRoute {}
```

Strings appear only where an identity is declared; every reference (`Commerce.actions.*`, `Flags.*`,
`I18n.*`) is a generated constant. The full model is in
[`apps/docs/src/guides/programming-model.mdx`](apps/docs/src/guides/programming-model.mdx).

## Surfaces

Each app lists its targets in `stackra.config.ts`, and `stackra gen` builds only those
([Stackra ADR 0281](https://docs.stackra.figentra.com/adr/0281-desktop-surfaces-targets-desktop-modes-and-overlay-styles)).

| Surface | Where                      | What you get                                                                     |
| ------- | -------------------------- | -------------------------------------------------------------------------------- |
| Web     | `apps/console`, `apps/web` | a client-rendered console and a server-rendered site on Cloudflare Workers       |
| PWA     | `apps/console`, `apps/web` | manifest, service worker, push, offline mutation queue                           |
| Desktop | `apps/console`             | Electron with the hardening baseline, tray, deep links, auto-update and overlays |
| Mobile  | `apps/mobile`              | Expo with native tabs, EAS builds and over-the-air updates                       |

The console's desktop target runs in `Hybrid` mode (a window plus a tray icon) with one overlay in
`src/config/desktop.config.ts`: `quick`, a launcher bar on `CommandOrControl+Shift+Space`. Any route
renders in an overlay as well as in the main window.

## Developer experience

- **`stackra` CLI** (pre-release): `gen`, `dev`, `verify`, `validate`, `new <kind> <name>`,
  `structure`, `doctor`, `db` and `infra`, wrapped by the root `pnpm` scripts. `pnpm verify` is the
  one gate, locally and in CI.
- **`stackra agents setup`** installs the Stackra skills, sub-agents and guard hooks for Claude
  Code, OpenCode or Kiro at user level, so the repository holds only this project's facts in
  [`AGENTS.md`](AGENTS.md).
- **Stackra MCP** ([`.mcp.yaml`](.mcp.yaml)): a local server that answers from this project's
  generated facts (kinds, manifests, routes, wiring) and a hosted one for framework know-how.
- **Quality tooling**: oxlint and oxfmt, Vitest, knip, cspell, lefthook, commitlint, changesets and
  gitleaks, all pinned through pnpm catalogs and `mise.toml`; Renovate (`renovate.json5`) proposes
  the updates.

## The one-line model

> **Everything with identity is a class with a kind decorator. Folders say the kind. Strings appear
> only where an identity is declared; every reference is a generated constant from `#stackra/*` or a
> class enum. Gen writes the wiring, the entries and the runtime config, and prints what it derived.
> Actions are the only behaviour.**

## Tree

```text
.
├── AGENTS.md                     agent entry: glossary ("not to be confused with") and rules
├── README.md                     this file
├── package.json                  root scripts over `stackra` and turbo; tooling devDependencies
├── pnpm-workspace.yaml           members + the only source of versions (catalogs, `workspace:*`)
├── turbo.jsonc                   task graph (`gen` before typecheck/test/build) and tier boundaries
├── .oxlintrc.jsonc               lint entry: extends `@stackra/oxlint-config`, no rules of its own
├── .oxfmtrc.jsonc                formatting: code at 100 columns, every type oxfmt supports
├── stackra.lock.yaml             pinned revision of every external producer manifest, once
├── runway.yaml                   ROOT runway: infrastructure only (providers, four environments,
│                                 shared resources, member defaults, targets, edge, secrets and
│                                 release policy)
├── .gitignore                    `.stackra/*` except the committed app-manifest.json, openapi.json
├── .github/                      Quality Gate (pre-release: `scripts/preview-gate.mjs`; then `pnpm verify`),
│                                 release (skips until pnpm-lock.yaml is committed), issue and PR
│                                 templates, CODEOWNERS, the main ruleset (`rulesets/main.json`),
│                                 Stackra brand assets (`assets/`, all rights reserved)
├── .changeset/                   pending release notes for packages (apps and services deploy by SHA)
├── lefthook.yml · .commitlintrc.yaml · knip.jsonc · .gitleaks.toml · .editorconfig · .gitattributes
├── renovate.json5                dependency update policy (catalogs, mise.toml, actions by SHA)
├── .easignore                    what EAS uploads for a mobile build (generated; re-includes
│                                 apps/mobile/.stackra/, which .gitignore keeps out of git)
├── .vscode/                      editor: oxfmt and oxlint through Oxc, TypeScript 7 extension
│                                 (useTsgo), schema mappings, debug configurations, tasks
├── .markdownlint.yaml · cspell.config.yaml   Markdown structure checks; spelling (editor, hook, CI)
├── schemas/                      JSON Schemas for runway.yaml, stackra.lock.yaml and .mcp.yaml;
│                                 temporary copies until static.stackra.figentra.com/schemas/ is live
├── mise.toml · .node-version     toolchain pins
├── .mcp.yaml                     every MCP server the project uses (Stackra local + hosted, docs and
│                                 tool servers); rendered to .mcp.json
├── .claude/launch.json           dev-server launch configuration for the assistant's preview
├── CLAUDE.md · CONTRIBUTING.md · SECURITY.md · LICENSE · NOTICE
├── apps/                         tier:app (apps/README.md)
│   ├── console/                  @acme/console: tenant console, targets web + pwa + desktop
│   │   ├── stackra.config.ts · runway.yaml · package.json · turbo.jsonc · tsconfig.json
│   │   ├── assets/{lang/<locale>/console.json, public/logo.svg}
│   │   ├── src/{console.app.ts, config/, panels/, routes/, components/, providers/, stores/,
│   │   │        menus/, commands/, bridges/, blocks/, documents/, overrides/, enums/, schemas/,
│   │   │        hooks/, styles/, __tests__/}
│   │   └── .stackra/{main.tsx, routes.tsx, index.html, sw.ts, pwa/, desktop/, vite.config.ts,
│   │                 gen/, app-manifest.json}
│   ├── web/                      @acme/web: public site and storefront, targets web + pwa (server-rendered)
│   │   │                         (React Router 7 on Workers)
│   │   ├── assets/{lang/<locale>/web.json, public/logo.svg}
│   │   ├── vite.extend.ts        the Vite hatch: a function file merged after the stackra plugin
│   │   ├── src/{web.app.ts, config/, routes/, components/, blocks/, analytics/, providers/,
│   │   │        hooks/, server/, overrides/, enums/, schemas/, styles/}
│   │   └── .stackra/{root.tsx, entry.client.tsx, entry.server.tsx, routes.ts, routes/, workers/,
│   │                 wrangler.jsonc, gen/, …}
│   ├── mobile/                   @acme/mobile: Expo app, targets ios + android
│   │   ├── assets/{lang/<locale>/mobile.json, public/logo.svg}
│   │   ├── src/{mobile.app.ts, config/, routes/, components/{pages,ui}/, providers/, stores/,
│   │   │        blocks/, documents/, analytics/, overrides/, enums/, schemas/, styles/,
│   │   │        __tests__/}
│   │   └── .stackra/{main.ts, app.config.ts, eas.json, eas-sync.json, metro.config.js,
│   │                 maestro/, gen/, …}
│   └── docs/                     @acme/docs: Mintlify; content root is src/ (docs.json, pages,
│                                 guides/, adr/, api-reference/, assets/)
├── packages/                     tier:lib, packages/<category>/<name> (packages/README.md)
│   ├── commerce/loyalty-kit/     @acme/loyalty-kit: the SHAPES CATALOGUE, every kind a package
│   │   │                         can hold
│   │   ├── assets/lang/<locale>/loyalty_kit.json
│   │   └── src/{index.ts, config/, contracts/, core/, node/, react/, testing/, __tests__/}
│   ├── security/access-log/      @acme/access-log: a DECORATOR package (createDecorator +
│   │                             Explorer + @Driver sinks, a retention job, the audit resource)
│   ├── cross-cutting/brand/      @acme/brand: one TypeScript token source, css/tokens.css and
│   │                             css/native.css generated from it, the mark
│   └── tooling/                  tier:config presets: typescript, oxlint (boundaries), vitest,
│                                 tsdown, commitlint
└── services/                     tier:service (services/README.md)
    ├── commerce/                 @acme/service-commerce: the reference service
    │   ├── stackra.config.ts · runway.yaml · package.json · turbo.jsonc · tsconfig.json
    │   ├── assets/{lang/<locale>/<module>.json, ai/orders/, public/orders/}
    │   ├── src/{main.ts, commerce.module.ts, config/, contracts/, __tests__/}
    │   ├── src/modules/{orders,catalogue,inventory,loyalty}/<kind>/   orders is THE reference
    │   │                                                              module (its README)
    │   └── .stackra/{app-manifest.json, openapi.json}  committed; gen/ is generated
    └── notifications/            @acme/service-notifications: the consumer (event + call +
                                  `.queue()`), delivery, the in-app inbox, preferences and the
                                  log; a port with two @Driver classes, a signed @Webhook receiver,
                                  an @Integration
```

### Package map

The template follows the settled package map, not the earlier
[Stackra ADR 0127](https://docs.stackra.figentra.com/adr/0127-package-categories-including-infrastructure)
rows. There is no `@stackra/forms` (forms are `@stackra/ui/form`, `useSchemaForm`), no
`@stackra/notifications` package (notifications is a service: delivery, the in-app inbox and
preferences), no `@stackra/pwa` or `@stackra/network` (`@stackra/platform` owns the targets, the
service worker runtime `./sw` and the `platform.network` capability; the build half is
`@stackra/vite-plugin`), no `@stackra/router` (`@stackra/navigation/router`) and no
`@stackra/templates` (mail is code: `mails/*.mail.tsx`).

## Which file owns which fact

One fact lives in exactly one file. The test that places it:

| Question about the fact                                                         | File                             | Examples                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| What IS the member? Same in every environment, read by tooling                  | `stackra.config.ts` (member)     | key, root class (`module`), targets (as `Target` cases), API area, env class, e2e projects and seeds, health checks and path, mobile `modules` + `priority`                                                                          |
| How does a package or the app BEHAVE? Would change if I shipped another product | `src/config/<fact>.config.ts`    | `@Config("<member-key>.<name>")` classes (packages use their module key, e.g. `loyalty_kit`): TTLs, locales, PWA display, Electron windows, driver choice (`@DriverOf`)                                                              |
| How and where does THIS member run, per environment?                            | `runway.yaml` (member)           | dev port and host, domains, public `vars`, resources and scaling, the deployable it joins, buckets, crons, secret NAMES, release channels, health thresholds                                                                         |
| What is the infrastructure? Would change if the company moved cloud or vendor   | `runway.yaml` (root)             | accounts, zones, the shared Postgres server, cache, queue provider, VPC, EAS project, defaults members inherit (`drivers.mail`: memory in dev and preview, notifications in staging and production), `isolate`, edge, release policy |
| Which revision of another team's service contract do the clients use?           | `stackra.lock.yaml`              | producer to revision, once per workspace                                                                                                                                                                                             |
| Can it be derived from declarations?                                            | nowhere: `stackra gen` writes it | the deployable list, one database per service, topics, entries, Vite/Metro/Expo/Electron config, wiring, migrations (`stackra db diff`)                                                                                              |
| Is it a version?                                                                | `pnpm-workspace.yaml` catalogs   | every external and `@stackra/*` version; members say `catalog:<name>` or `workspace:*`                                                                                                                                               |

A package has no runway: publishing is `publishConfig` (with `exports` pointing at `dist`) plus a
changeset. A member file may override a root default, never the reverse. Secret values live only in
Infisical
([Stackra ADR 0173](https://docs.stackra.figentra.com/adr/0173-secrets-infisical-is-the-source-of-production-secrets));
files name them. Wrong place, for each row: a port number is runway, not config; a TTL is config,
not runway; the list of targets is `stackra.config.ts`, never the `@App` class; a column is the
model, never a hand-written migration.

## How each member kind is created

| Kind    | Command                                              | What it writes                                                                                                                                                                                |
| ------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| project | `pnpm create stackra <name>`                         | this root, one example service, the console                                                                                                                                                   |
| service | `pnpm new service <name>`                            | `services/<name>/` with `stackra.config.ts` (`defineService`), `runway.yaml`, `src/main.ts` (`createApp(Root, { wiring })` from `@stackra/app/server`), root module, `assets/`, the boot test |
| app     | `pnpm new app <name> --targets web,pwa,desktop`      | `apps/<name>/` with `stackra.config.ts` (`defineApp`), `runway.yaml`, the `@App` class, `assets/`, `src/config/`; no authored entry (gen writes `.stackra/main.tsx` / `main.ts`)              |
| package | `pnpm new package <name> --category <c> --entries …` | `packages/<c>/<name>/` with `src/index.ts`, the named entries, `assets/`, `./testing`, `publishConfig`                                                                                        |
| module  | `pnpm new module <key>` (in a service or package)    | `src/modules/<key>/<key>.module.ts` + README; lang goes to the member's `assets/lang/<locale>/<key>.json`                                                                                     |

`stackra.config.ts` keeps `defineApp` / `defineService`: it is build-config input read from the AST
(like `vite.config.ts`), the one carve-out from the retired define family, recorded beside
[Stackra ADR 0145](https://docs.stackra.figentra.com/adr/0145-tokens-are-define-token-values-and-global-helpers-are-banned).
A package keeps its module root in `package.json#stackra.module`; it has no `stackra.config.ts`. The
escape hatches are function files, never an object in `stackra.config.ts`: `vite.extend.ts`,
`metro.extend.ts`, `electron.extend.ts`, merged after the stackra plugin.

## Choose

Where the template offers two valid shapes, this is the rule for picking one.

| Question                                 | Choose                                                                                                                     |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `@Crud` default or a hand-written query? | `@Crud` while the standard list is enough; a query when the filter narrows by actor or the shape is not the model's        |
| `runs:` workflow or an inline `handle`?  | `handle` for one step in one transaction; `runs:` when there is more than one step, a compensation or an external call     |
| `@Query` or `@Action`?                   | `@Query` for a read with no transaction; `@Action` for anything that changes state, or that must be audited and replayed   |
| Repository or module service?            | an injected `Repository<Model>` for plain reads and writes; a module service when the logic has a name and is reused       |
| A permission on the route or the action? | on the action or query; the route derives its permission from what it calls and only a route that calls neither states one |
| `prefetch` or `loader`?                  | `prefetch: [Query…]` when the route only warms queries; `loader` only for composite logic, and then no `prefetch`          |
| Config, settings or flag?                | config when it is deploy-time and the same for every tenant; settings when a tenant admin changes it; a flag for on/off    |
| An enum or a string?                     | an enum for any closed set of house values; a string only at a declaration site, a `keyof`, a driver name or a tool value  |
| Where does a block live?                 | one folder per block: `blocks/<name>/` with `<name>.block.ts`, `<name>.tsx`, `index.ts` and `__tests__/<name>.test.tsx`    |

## File kind → folder → test

`pnpm new <kind> <name>` writes the subject and its test together (`--module <key>` in a service,
`--entry core|node|react|testing` in a package). Test suffixes: `.test.ts(x)` unit (memory drivers),
`.int.test.ts` integration (Postgres container, outbox), `.contract.test.ts`, `.e2e.test.ts`
(Playwright, always with axe), `.flow.yaml` (Maestro). Every test sits in `__tests__/` beside its
subject
([Stackra ADR 0022](https://docs.stackra.figentra.com/adr/0022-tests-live-in-tests-folders)), opens
with the file contract and carries a docblock on every `describe` and `it`.

### Test header and helpers

The header of a test file (what `pnpm new test` writes) names the tier and the helpers it uses:

```ts
/**
 * Stackra file contract:
 * Purpose: proves <the behaviour>.
 * Boundary: <the tier>; helpers come from the packages that own them.
 * Runtime: node
 * Governing contract: Stackra ADR 0022, Stackra ADR 0007 (amended: test docblocks)
 */
```

Vitest, factories, `createMatcher`, `freezeClock` and `freezeIds` come from `@stackra/testing`;
never import `vitest` directly. Domain helpers come from the package that owns the concept:
`@stackra/container/testing` `createTestingModule`; `@stackra/actions/testing` `run`,
`fakeActionContext`, `fakeHookContext`; `@stackra/iam/testing` `actors`; `@stackra/errors/testing`
`refusal`, `toRefuseWith`; `@stackra/events/testing` `toEmit`, `drainOutbox`;
`@stackra/database/testing` `usePostgres`; `@stackra/clients/testing`
`fakeClient(<client>, (fake) => fake.<path>.returns(v))` or `.throws(refusal(ref))`;
`@stackra/settings/testing` `fakeSettings`; `@stackra/queue/testing` `fakeQueue`, `toDeadLetter`;
`@stackra/feature-flags/testing` flag helpers; `@stackra/gen/testing` `toMatchManifest`,
`expectBackwardCompatible`; `@stackra/ui/testing` `render`; `@stackra/testing/native` for React
Native.

### Services and packages (in a module)

| Kind                               | Folder / suffix                                                                                 | Test                                                        | Example                                                                                         |
| ---------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| root module + boot                 | `src/<name>.module.ts`, `src/main.ts`                                                           | `src/__tests__/<name>.module.int.test.ts`                   | `services/commerce/src/__tests__/commerce.module.int.test.ts`                                   |
| module                             | `modules/<key>/<key>.module.ts`                                                                 | covered by the boot test                                    | `services/commerce/src/modules/orders/orders.module.ts`                                         |
| model                              | `models/*.model.ts`                                                                             | none; a factory is written instead                          | `orders/models/order.model.ts`                                                                  |
| model state                        | `states/<model>.state.ts`                                                                       | through the action that transitions                         | `orders/states/order.state.ts`                                                                  |
| enum                               | `enums/*.enum.ts` (`class X extends Enum<X>`)                                                   | none                                                        | `orders/enums/order-status.enum.ts`                                                             |
| schema                             | `schemas/*.schema.ts` (`class X extends Schema(z…)`, one per file)                              | through action and contract tests                           | `orders/schemas/create-order-input.schema.ts`                                                   |
| error                              | `errors/*.error.ts`                                                                             | `toRefuseWith(refusal(Refusals.x.y))` in the thrower's test | `orders/errors/order-not-payable.error.ts`                                                      |
| migration                          | `migrations/<nnnn>-<name>.migration.ts` (`Blueprint`, `stackra db diff` output)                 | applied by the `.int` tier                                  | `orders/migrations/0002-add-order-paid-at.migration.ts`                                         |
| factory / seeder                   | `factories/*.factory.ts`, `seeds/*.seed.ts`                                                     | none                                                        | `orders/factories/order.factory.ts`, `orders/seeds/demo.seed.ts`                                |
| repository                         | `repositories/*.repository.ts` (`@RepositoryOf`)                                                | through its query                                           | `orders/repositories/order.repository.ts`                                                       |
| action                             | `actions/*.action.ts`                                                                           | `actions/__tests__/<name>.action.test.ts`                   | `orders/actions/cancel-order.action.ts`                                                         |
| job                                | `actions/*.action.ts` (`@AsJob`, `@Cron`)                                                       | an action test                                              | `orders/actions/expire-unpaid-orders.action.ts`                                                 |
| query                              | `queries/*.query.ts`                                                                            | `queries/__tests__/<name>.query.test.ts`                    | `orders/queries/list-orders.query.ts`, `catalogue/queries/get-product-by-slug.query.ts`         |
| workflow                           | `workflows/*.workflow.ts`                                                                       | `workflows/__tests__/<name>.workflow.int.test.ts`           | `orders/workflows/create-order.workflow.ts`                                                     |
| module service                     | `services/*.service.ts` (`@Crud` optional)                                                      | `services/__tests__/<name>.service.test.ts`                 | `orders/services/order-pricing.service.ts`                                                      |
| policy / guard                     | `policies/*.policy.ts`, `guards/*.guard.ts`                                                     | `policies/__tests__/<name>.policy.test.ts`                  | `orders/policies/order.policy.ts`, `orders/guards/accepting-orders.guard.ts`                    |
| permissions                        | `permissions/*.permission.ts`                                                                   | the `.contract` test                                        | `orders/permissions/order.permission.ts`                                                        |
| entitlement                        | `entitlements/*.entitlement.ts` (`@Entitlement`)                                                | through the action that checks it                           | `catalogue/entitlements/product-limit.entitlement.ts`                                           |
| event                              | `events/*.event.ts` (`@Event`), `versions/*.upcast.ts`                                          | the `.contract` test                                        | `orders/events/order-paid.event.ts`, `loyalty-kit/src/node/versions/points-earned-v1.upcast.ts` |
| response change                    | `versions/*.change.ts` (`@Change({ since })`)                                                   | the `.contract` test                                        | `orders/versions/order-view-2027-03.change.ts`                                                  |
| listener                           | `listeners/*.listener.ts` (`@OnEvent`)                                                          | `listeners/__tests__/<name>.listener.test.ts`               | `loyalty/listeners/earn-on-order-paid.listener.ts`                                              |
| hook point / hook                  | `hooks/*.hook-point.ts` (`@HookPoint`), `hooks/*.hook.ts` (`@Hook`)                             | `hooks/__tests__/<name>.hook.test.ts`                       | `orders/hooks/order.hook-point.ts`, `loyalty/hooks/redeem-points.hook.ts`                       |
| link                               | `links/*.link.ts` (`@Link({ relation: ManyToOne })`)                                            | through the query over it                                   | `orders/links/order-line-variant.link.ts`                                                       |
| port + drivers                     | `contracts/*.port.ts` (abstract class), `drivers/*.driver.ts` (`@Driver`, always in `drivers/`) | `drivers/__tests__/<real>.driver.int.test.ts`               | `loyalty-kit/src/contracts/loyalty-ledger.port.ts`, `messages/drivers/`                         |
| settings / flag                    | `settings/*.setting.ts`, `settings/*.flag.ts` (`@Flag`)                                         | faked with `fakeSettings`                                   | `orders/settings/order.setting.ts`, `orders/settings/quick-order.flag.ts`                       |
| mail                               | `mails/*.mail.tsx` (`@Mail`)                                                                    | through the listener or action that sends                   | `orders/mails/order-placed.mail.tsx`                                                            |
| resource / widget / document       | `resources/`, `widgets/`, `documents/`                                                          | the `.contract` test and the console e2e tier               | `orders/resources/order.resource.ts`, `orders/documents/sales-today.document.ts`                |
| search index                       | `search/*.search.ts` (`@SearchIndex`)                                                           | through the query that uses it                              | `catalogue/search/product.search.ts`                                                            |
| bucket                             | `buckets/*.bucket.ts` (`@Bucket`)                                                               | through the action that uploads                             | `catalogue/buckets/product-images.bucket.ts`                                                    |
| connection                         | `connections/*.connection.ts` (`@Connection`)                                                   | through the driver that uses it                             | `notifications/src/modules/messages/connections/resend.connection.ts`                           |
| override point                     | `override-points/*.point.ts` (`@OverridePoint`); bindings are `overrides/*.override.tsx`        | gen checks the binding                                      | `orders/override-points/revenue-sparkline.point.ts`                                             |
| AI                                 | `ai/*.skill.ts`, `ai/*.prompt.ts`, `ai/*.facts.ts`                                              | `.stackra/gen/ai.ts` lists what became a tool               | `orders/ai/`                                                                                    |
| integration                        | `integrations/*.integration.ts` (`@Integration`)                                                | through the action that uses it                             | `messages/integrations/resend.integration.ts`                                                   |
| webhook                            | `webhooks/*.webhook.ts` (`@Webhook`, signature verified, `ApiArea.Public`)                      | `webhooks/__tests__/<name>.webhook.test.ts`                 | `notifications/src/modules/messages/webhooks/inbound-mail.webhook.ts`                           |
| decorator + Explorer               | `core/decorators/*.decorator.ts`, `node/<pkg>.explorer.ts`                                      | `node/__tests__/<pkg>.explorer.test.ts`                     | `packages/security/access-log`                                                                  |
| type / constant / token (package)  | `core/{types,interfaces,constants,functions,tokens}/` (one declaration per file)                | through their users                                         | `packages/cross-cutting/brand/src/core/types/brand-tokens.type.ts`                              |
| fake / matcher / factory (package) | `testing/{fakes,matchers,factories}/` (`createMatcher`)                                         | `testing/matchers/__tests__/*.matcher.test.ts`              | `loyalty-kit/src/testing/`                                                                      |
| contracts entry                    | `src/contracts/index.ts` (service: types and codes; package: ports, types, enums)               | `src/__tests__/app-manifest.contract.test.ts`               | `services/commerce/src/contracts/index.ts`                                                      |
| config                             | `src/config/*.config.ts` (`@Config`, host layer `override(...)`)                                | compiled by the module test                                 | `services/commerce/src/config/loyalty-kit.config.ts`                                            |
| lang / asset                       | member root `assets/lang/<locale>/<ns>.json`, `assets/<kind>/<module>/`                         | gen fails on a key missing in one locale                    | `services/commerce/assets/lang/en/orders.json`                                                  |

### Apps

| Kind                    | Folder / suffix                                                                                 | Test                                                                   | Example                                                                       |
| ----------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| app root                | `src/<key>.app.ts` (`@App`)                                                                     | `src/__tests__/<key>.app.test.ts`                                      | `apps/console/src/console.app.ts`                                             |
| panel                   | `panels/*.panel.ts` (`@Panel`, declared once in the app that mounts it)                         | none; gen writes `Panels` into every member that references it         | `apps/console/src/panels/tenant-admin.panel.ts`                               |
| route / layout          | `routes/*.route.ts`, `routes/*.layout.ts`                                                       | `routes/__tests__/<name>.route.test.tsx`, `.e2e.test.ts`, `.flow.yaml` | `apps/console/src/routes/quick-order.route.ts`                                |
| page component          | `components/pages/<name>/` (+ `use-<name>.ts`)                                                  | `components/pages/<name>/__tests__/`                                   | `apps/mobile/src/components/pages/orders/`                                    |
| component               | `components/<name>/{<name>.tsx,index.ts}`                                                       | `components/<name>/__tests__/<name>.test.tsx`                          | `apps/web/src/components/product-card/`                                       |
| provider / store        | `providers/<name>/{<name>.provider.ts, <name>.context.tsx, use-<name>.ts}`, `stores/*.store.ts` | `__tests__/` beside them                                               | `apps/console/src/providers/session/`, `apps/console/src/stores/ui.store.ts`  |
| menu / command / bridge | `menus/`, `commands/`, `bridges/*.bridge.ts` (desktop)                                          | `__tests__/` beside them                                               | `apps/console/src/bridges/print-receipt.bridge.ts`                            |
| block / document        | `blocks/<name>/{<name>.block.ts,<name>.tsx,index.ts}`, `documents/*.document.ts`                | `blocks/<name>/__tests__/`                                             | `apps/mobile/src/blocks/promo-banner/`                                        |
| analytics event         | `analytics/*.event.ts` (`@AnalyticsEvent`)                                                      | through the component that tracks it                                   | `apps/web/src/analytics/lead-submitted.event.ts`                              |
| flag (app)              | `flags/*.flag.ts` (`@Flag` from `@stackra/feature-flags`)                                       | through the component it gates                                         | `apps/web/src/flags/pricing-yearly-first.flag.ts`                             |
| React hook              | `hooks/use-*.ts` (shared) or beside its component                                               | `hooks/__tests__/use-<name>.test.ts`                                   | `apps/web/src/hooks/use-variant-choice.ts`                                    |
| server helper (web)     | `server/*.server.ts` (takes `ctx`, never imports config)                                        | `server/__tests__/<name>.server.test.ts`                               | `apps/web/src/server/resolve-site.server.ts`                                  |
| schema / error (app)    | `schemas/*.schema.ts`, `errors/*.error.ts`                                                      | `schemas/__tests__/<name>.schema.test.ts`                              | `apps/console/src/schemas/quick-order-form.schema.ts`                         |
| override                | `overrides/<module>/{components,lang}/*.override.tsx`                                           | `__tests__/` beside the component                                      | `apps/console/src/overrides/orders/components/revenue-sparkline.override.tsx` |
| enum                    | `enums/*.enum.ts` (only when one app uses the set)                                              | none                                                                   | `apps/console/src/enums/density.enum.ts`                                      |
| config / env            | `src/config/*.config.ts`, `env.config.ts`                                                       | none                                                                   | `apps/web/src/config/edge.config.ts`                                          |

## Generated, never authored

`stackra gen` writes `.stackra/` in every member: the entries (`main.tsx` / `main.ts` / `root.tsx`),
Vite, Metro, Expo, Electron and Wrangler config, and `.stackra/gen/*.ts`, imported only as
`#stackra/<name>` (`clients`, `i18n`, `assets`, `env`, `wiring`, `flags`, `queues`, `panels`,
`slots`, `routes`, …). Every `#stackra/*` import in this tree has its sample, and every sample is
complete. Consumed services' lang files are copied into `.stackra/lang/`, so an app never imports a
service package. `.stackra/app-manifest.json` and `.stackra/openapi.json` are committed: they are
the contract consumers generate their clients from, and `apps/docs` publishes projections of them.

## Framework project vs product repository

`pnpm create stackra my-app` renders this shape with one example service. A larger product uses the
same generator: many `services/<name>`, private `@acme/*` packages for logic two of its services
share ([Stackra ADR 0259](https://docs.stackra.figentra.com/adr/0259-module-placement-three-homes),
home B), and the apps. Nothing in a service file differs between the two.

## Make it yours

Acme is the example product throughout: every project-specific value names it, and none is a
placeholder. `acme.example` is a reserved example domain. Replace these with your own before the
first push (`pnpm create stackra` asks for them and rewrites them for you):

| Value                                                                 | Where                                                                                                                                                    | Put                                                                           |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `acme-platform` (root package `name`)                                 | `package.json`, `runway.yaml` (`project`, `providers.encore.app`, GitHub), `stackra.lock.yaml`, `.mcp.yaml` (Encore app id)                              | your project name and Encore app id                                           |
| `@acme/*` member names                                                | every app, service and example package `package.json` and their imports, the root scripts' `--filter`, `.claude/launch.json` (`--filter` of each server) | your npm scope                                                                |
| `acme` organisation                                                   | `runway.yaml` (GitHub, Sentry, Expo), `.github/ISSUE_TEMPLATE/config.yml` (security advisory URL)                                                        | your GitHub, Sentry and Expo organisations                                    |
| `@acme/platform-team`                                                 | `.github/CODEOWNERS`, `runway.yaml` (production reviewers), `CONTRIBUTING.md` (conduct reports)                                                          | your GitHub team                                                              |
| `acme.example`, `*.acme.example`                                      | `runway.yaml`, app `runway.yaml`, config defaults                                                                                                        | your domains                                                                  |
| `example.acme.console`, `example.acme.mobile`, `acme-console`, `acme` | `desktop.config.ts` (app id, scheme), `release.config.ts` (bundle id, package, scheme), Maestro flows                                                    | your bundle ids and URL schemes                                               |
| `figentra/stackra-template` (CI badge, repository URL)                | the README badges, `repository` in each `packages/*/*/package.json` (not tooling)                                                                        | your repository (npm provenance checks it)                                    |
| copyright holder                                                      | `LICENSE` and the copies in each package                                                                                                                 | yours                                                                         |
| product brand (Acme mark, blue accent)                                | `packages/cross-cutting/brand`, `apps/*/assets/public/logo.svg`, `apps/docs/src/docs.json`                                                               | your brand                                                                    |
| Stackra brand assets (all rights reserved)                            | `.github/assets/` (see its `NOTICE`), the README logo block, the brand line in `NOTICE`                                                                  | remove them, or keep them unmodified to say the project is built with Stackra |
| social preview image                                                  | `.github/assets/social-preview.png`, uploaded by hand under **Settings → General → Social preview**                                                      | your own image; GitHub has no file setting for it                             |
| `refs-issue-key` rule (off)                                           | `.commitlintrc.yaml`                                                                                                                                     | your tracker's prefix under `rules`, to require an issue-key footer           |
| `GITHUB_TOKEN` in the release job                                     | `.github/workflows/release.yml`                                                                                                                          | a GitHub App token if the version PR must run the gate                        |

Then import `.github/rulesets/main.json` (Settings → Rules → Rulesets), turn on private
vulnerability reporting (`SECURITY.md`), and install the Renovate app.

Template-only lines, removed in a real project once `@stackra/*` is published: `!.stackra/**` in the
root and member `.gitignore` files with the committed `.stackra/gen` samples, and the pre-release
step in `.github/workflows/ci.yml` with `.github/scripts/preview-gate.mjs`.

Secret values never go in a file: a config field is `@Secret`/`@Env`, `runway.yaml` names the
secret, and the value lives in your secret store (Infisical by default, Stackra ADR 0173).

## Docs

- Guides: [`apps/docs/src/guides`](apps/docs/src/guides) (programming model, adding a field,
  testing); run `pnpm docs`.
- Architecture decisions: [`apps/docs/src/adr`](apps/docs/src/adr).
- API reference: [`apps/docs/src/api-reference`](apps/docs/src/api-reference), projected from the
  committed manifests.
- The framework's guides and ADRs: [docs.stackra.figentra.com](https://docs.stackra.figentra.com).

## Reading order

1. The monorepo root: this README's [Tree](#tree), then `package.json`, `pnpm-workspace.yaml` and
   `turbo.jsonc`
2. `AGENTS.md` (glossary and rules)
3. `services/commerce/src/modules/orders/README.md`, then `actions/create-order.action.ts` and
   `workflows/create-order.workflow.ts`
4. `services/commerce/src/modules/loyalty/hooks/redeem-points.hook.ts` (extending another module)
5. `services/commerce/.stackra/gen/wiring.ts` and `hooks.ts` (what gen derived)
6. `services/notifications/README.md` (reaching another service: event, call, command)
7. `packages/commerce/loyalty-kit/README.md` (shapes index) and
   `packages/security/access-log/README.md` (decorators)
8. `apps/console/README.md` (an app: routes, flags, the generated entry), then `runway.yaml` and
   `apps/console/runway.yaml`
9. `apps/docs/src/guides/add-a-field.mdx` (the first change every newcomer makes: a field from the
   model to the test)

## Licence

MIT, see [`LICENSE`](LICENSE). The bundled Stackra brand images, fonts and paid-licence code are
excluded, see [`NOTICE`](NOTICE). The Stackra and Figentra names and logos are trademarks of
Figentra Technologies L.L.C (`.github/assets/NOTICE`).
