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
behaviour as kind classes (actions, queries, models, events, routes), each extending the base of its
kind in the folder of its kind, and `stackra gen` derives the rest: the identities, the dependency
wiring, the HTTP and MCP endpoints, typed clients for every consumer, the runtime entries and the
tool configs for web, PWA, desktop and mobile. This repository is the reference monorepo that
`pnpm create stackra` will render: two services, three apps, three packages, five tooling presets
and the docs site, each showing every file kind with its test. The example product is **Acme**, a
multi-tenant commerce platform: a staff console, a public storefront, a mobile app, and the commerce
and notifications services behind them.

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
| `packages/security/access-log`     | a decorator package: the `@AccessLogged` class facet with its explorer       |
| `packages/cross-cutting/brand`     | brand tokens as TypeScript, CSS and native CSS                               |
| `packages/tooling/*`               | TypeScript, oxlint, Vitest, tsdown and commitlint presets                    |
| `runway.yaml`, `stackra.lock.yaml` | infrastructure and topology; pinned external producer manifests              |

The full annotated tree is in [Tree](#tree) below.

## The programming model in one screen

The path says the kind, the base class is the kind, the type gives the shape and the names give
identity
([Stackra ADR 0294](https://docs.stackra.figentra.com/adr/0294-programming-model-v3-grammar-folders-identities-and-naming)).
An **action** is the unit of behaviour. One class becomes an HTTP endpoint, an MCP tool, a typed
client method and a permission check:

```ts
// services/commerce/src/modules/orders/actions/cancel-order.action.ts (abridged)
export class CancelOrderAction extends Action({
  key: "order.cancel",
  actors: [ActorKind.User, ActorKind.Agent, ActorKind.Service],
  tool: true,
  ux: {
    confirm: Tone.Danger,
    after: [UxAfter.Refresh],
  },
}) {
  /** @param orders - reads and transitions the order. */
  constructor(private readonly orders: OrderService) {
    super();
  }

  /** Cancels an unpaid order after the record policy allows it. */
  async handle(input: CancelOrderInput, ctx: ActionContext): Promise<CancelOrderOutput> {
    const order = await this.orders.findOneOrFail({ id: input.orderId });
    await ctx.authorize(order);
    this.orders.cancel(order, CancelReason.Staff);
    return CancelOrderOutput.create({ orderId: order.id, status: order.status });
  }
}
```

Gen derives the rest from the names: the wire key `orders.order.cancel@1`, the permission
`orders.order.cancel` (its risk is on `OrderPermissions.cancel`), the route
`PUT /orders/:orderId/cancel`, the confirmation text key `orders::actions.order.cancel.confirm`, and
the input and output schemas from the types of `handle`. A **model** is a class; its field types are
its columns, and traits add the public id, tenancy, timestamps, user stamps and optimistic locking:

```ts
// services/commerce/src/modules/orders/models/order.model.ts (abridged)
@Index(["tenantId", "status", "createdAt"])
export class Order extends Model.with(
  HasPublicId("ord"),
  BelongsToTenant,
  Timestamps,
  UserStamps,
  Versioned,
) {
  /** The customer principal who placed it; set from the actor, never from input. */
  customerId!: PublicId<"usr">;

  /** Lifecycle; written only by OrderStateMachine. The initializer is the initial state. */
  status: OrderStatus = OrderStatus.PendingPayment;

  /** Amount charged; columns `total_minor` and `total_currency`. */
  total!: Money;

  /** The product lines; owned by the order and deleted with it. */
  @OneToMany(() => OrderLine, (line) => line.order, { orphanRemoval: true })
  lines = new Collection<OrderLine>(this);
}
```

A **route** is a folder: the page class names its path, layout and tab, the component beside it
(`quick-order.tsx`) is bound by name, and `submit` runs the action through the generated client:

```ts
// apps/console/src/routes/quick-order/quick-order.route.ts (abridged)
export class QuickOrderRoute extends Route({
  path: "/quick-order",
  layout: ShellLayout,
  tab: {
    order: 2,
    icon: Icons.Bolt,
  },
  flag: Flags.orders.quick_order,
}) {
  /** Places the order, then opens it in the orders resource; offline, the queue keeps it. */
  override async submit(ctx: RouteContext<this>) {
    const form = validate(QuickOrderForm, await ctx.formData());
    if (!form.success) return ctx.fieldErrors(form.error);
    const result = await ctx.action(
      Commerce.actions.CreateOrder,
      QuickOrderForm.toInput(form.data),
    );
    if (!result.ok) return ctx.fieldErrors(result.error);
    if (result.queued) return null;
    return ctx.redirect(Resources.Order.view, { id: result.data.orderId });
  }
}
```

Strings appear only where an identity is written; every reference (`Commerce.actions.*`, `Flags.*`,
`Routes.*`, `I18n.*`) is a generated constant. The full model, with the group table, the kind table
and the dictionary, is in
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
- **Quality tooling**: oxlint and oxfmt, Vitest, knip, cspell (enforced in the hook and the gate),
  lefthook, commitlint, changesets and gitleaks, all pinned through pnpm catalogs and `mise.toml`;
  Renovate (`renovate.json5`) proposes the updates.

## The one-line model

> **The path says the kind, the base class is the kind, the type gives the shape, and the names give
> identity. Strings appear only where an identity is written; every reference is a generated
> constant from `#stackra/*` or an enum value. Gen derives the identities and locks them in
> `stackra.manifest.json`, and writes the wiring, the entries and the tool configs. Actions are the
> only behaviour.**

## Tree

```text
.
├── AGENTS.md                     agent entry: grammar, group folders, kind table, identities,
│                                 dictionary and rules
├── README.md                     this file
├── package.json                  root scripts over `stackra` and turbo; tooling devDependencies
├── pnpm-workspace.yaml           members + the only source of versions (catalogs, `workspace:*`)
├── turbo.jsonc                   task graph (`gen` before typecheck/test/build) and tier boundaries
├── .oxlintrc.jsonc               lint entry: extends `@stackra/oxlint-config`, no rules of its own
├── .oxfmtrc.jsonc                formatting: code at 100 columns, every type oxfmt supports
├── stackra.lock.yaml             pinned revision of every external producer manifest, once
├── runway.yaml                   ROOT runway: where things run and how they are packed (providers,
│                                 four environments, shared pools, the topology groups of each
│                                 environment, defaults, targets, edge, secrets, release policy)
├── .gitignore                    `.stackra/*` and the generated root shims of tool configs
├── .github/                      Quality Gate (pre-release: `scripts/preview-gate.mjs`; then `pnpm verify`),
│                                 release (skips until pnpm-lock.yaml is committed), issue and PR
│                                 templates, CODEOWNERS, the main ruleset (`rulesets/main.json`),
│                                 Stackra brand assets (`assets/`, all rights reserved)
├── .changeset/                   pending release notes for packages (apps and services deploy by SHA)
├── lefthook.yml · .commitlintrc.yaml · knip.jsonc · .gitleaks.toml · .editorconfig · .gitattributes
├── renovate.json5                dependency update policy (catalogs, mise.toml, actions by SHA)
├── .easignore                    what EAS uploads for a mobile build (generated; re-includes
│                                 apps/mobile/.stackra/ and its root shims, which git ignores)
├── .vscode/                      editor: oxfmt and oxlint through Oxc, TypeScript 7 extension
│                                 (useTsgo), schema mappings, debug configurations, tasks
├── .markdownlint.yaml · cspell.config.yaml   Markdown structure checks; spelling (editor, hook, CI)
├── schemas/                      JSON Schemas for runway.yaml (format 3), stackra.lock.yaml and
│                                 .mcp.yaml; copies until static.stackra.figentra.com serves them
├── mise.toml · .node-version     toolchain pins
├── .mcp.yaml                     every MCP server the project uses (Stackra local + hosted, docs and
│                                 tool servers); rendered to .mcp.json
├── .claude/launch.json           dev-server launch configuration for the assistant's preview
├── CLAUDE.md · CONTRIBUTING.md · SECURITY.md · LICENSE · NOTICE
├── apps/                         tier:app (apps/README.md)
│   ├── console/                  @acme/console: tenant console, targets web + pwa + desktop
│   │   ├── stackra.config.ts · runway.yaml · package.json · turbo.jsonc · tsconfig.json
│   │   ├── stackra.manifest.json  committed contract (generated): the gateway reads `consumes`
│   │   ├── assets/{lang/<locale>/console.json, public/logo.svg}
│   │   ├── src/{console.module.ts, app.error.tsx, config/, panels/, routes/<name>/, components/,
│   │   │        stores/, menus/, shortcuts/, blocks/<name>/, documents/, enums/, styles/,
│   │   │        __tests__/}
│   │   └── .stackra/{entry/, gen/, vite.config.ts, vitest.config.ts, playwright.config.ts,
│   │                 index.html, sw.ts, pwa/, desktop/}   generated
│   ├── web/                      @acme/web: public site and storefront, targets web + pwa
│   │   │                         (React Router 7 on Workers, server-rendered)
│   │   ├── assets/{lang/<locale>/web.json, public/logo.svg}
│   │   ├── vite.extend.ts        the Vite hatch: add-only, opens with a `Reason:` header
│   │   ├── src/{web.module.ts, config/, routes/<name>/, components/, blocks/<name>/, analytics/,
│   │   │        flags/, hooks/, menus/, enums/, styles/}
│   │   └── .stackra/{entry/, gen/, vite.config.ts, react-router.config.ts, wrangler.jsonc, …}
│   ├── mobile/                   @acme/mobile: Expo app, targets ios + android
│   │   ├── assets/{lang/<locale>/mobile.json, public/logo.svg}
│   │   ├── src/{mobile.module.ts, config/ (chrome.config.ts), routes/<name>/, components/,
│   │   │        stores/, menus/ (tab-bar.menu.ts), blocks/<name>/, documents/, analytics/,
│   │   │        enums/, styles/, __tests__/}
│   │   └── .stackra/{entry/, gen/, app.config.ts, eas.json, metro.config.js, maestro/, …}
│   └── docs/                     @acme/docs: Mintlify; content root is src/ (docs.json, pages,
│                                 guides/, adr/, api-reference/, assets/)
├── packages/                     tier:lib, packages/<category>/<name> (packages/README.md)
│   ├── commerce/loyalty-kit/     @acme/loyalty-kit: the SHAPES CATALOGUE, every kind a package
│   │   │                         can hold
│   │   ├── assets/lang/<locale>/loyalty_kit.json
│   │   └── src/{config/, contracts/{ports,enums,types}/, core/, node/ (the module and its
│   │            groups), react/<name>/, testing/, __tests__/}
│   ├── security/access-log/      @acme/access-log: a DECORATOR package (the `@AccessLogged` class
│   │                             facet + its explorer, sink drivers, a retention job, the audit
│   │                             resource)
│   ├── cross-cutting/brand/      @acme/brand: one TypeScript token source, css/tokens.css and
│   │                             css/native.css generated from it, the mark
│   └── tooling/                  tier:config presets: typescript, oxlint (boundaries), vitest,
│                                 tsdown, commitlint
└── services/                     tier:service (services/README.md)
    ├── commerce/                 @acme/service-commerce: the reference service
    │   ├── stackra.config.ts · runway.yaml · package.json · turbo.jsonc · tsconfig.json
    │   ├── stackra.manifest.json · openapi.json   committed contract (generated)
    │   ├── assets/{lang/<locale>/<module>.json, ai/orders/, public/orders/}
    │   ├── src/{commerce.module.ts, config/, __tests__/}
    │   ├── src/modules/{orders,catalogue,inventory,loyalty}/<group>/   orders is THE reference
    │   │                                                               module (its README)
    │   └── .stackra/{entry/server.ts, gen/, vitest.config.ts}   generated
    └── notifications/            @acme/service-notifications: the consumer (event + call +
                                  `.queue()`), delivery, the in-app inbox, preferences and the
                                  log; a port with two drivers and a signed inbound webhook event
```

### Package map

The template follows the settled package map, not the earlier
[Stackra ADR 0127](https://docs.stackra.figentra.com/adr/0127-package-categories-including-infrastructure)
rows. `@stackra/notifications` (it was `@stackra/mail`) holds the notification kinds, the `Notifier`
port and the mail-body helpers; the notifications service does delivery, the in-app inbox and
preferences. `@stackra/shortcuts` was `@stackra/kbd`, and shape tooling (`Schema`, `Enum`, the field
decorators) is `@stackra/validation`, so there is no `@stackra/schema`. There is no `@stackra/forms`
(forms are `@stackra/ui/form`, `useSchemaForm`), no `@stackra/pwa` or `@stackra/network`
(`@stackra/platform` owns the targets, the service worker runtime `./sw` and the `platform.network`
capability; the build half is `@stackra/vite-plugin`), no `@stackra/router`
(`@stackra/navigation/router`) and no `@stackra/templates` (a mail body is a `.mail.tsx` function
beside its notification).

## Which file owns which fact

One fact lives in exactly one file
([Stackra ADR 0295](https://docs.stackra.figentra.com/adr/0295-build-and-entry-stackra-config-generated-tool-configs-and-entries)
decision 4,
[Stackra ADR 0296](https://docs.stackra.figentra.com/adr/0296-runway-v3-member-requires-and-root-topology-groups)).
The test that places it:

| Question about the fact                                                     | File                             | Examples                                                                                                                                                             |
| --------------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What IS the member? Same in every environment, read only by build tools     | `stackra.config.ts` (member)     | `defineApp` / `defineService` / `definePackage`: targets, API area, env class, name, scheme, bundle ids, e2e seeds, health checks, tool sections                     |
| How does it BEHAVE while it runs? Would change if I shipped another product | `src/config/<fact>.config.ts`    | `extends Config` classes (key derived) and `<Host><Base>` overrides: TTLs, locales, PWA display, Electron windows, native chrome, driver choices                     |
| What does THIS member NEED, per environment?                                | `runway.yaml` (member)           | dedicated resources with a reason (`requires`), secret NAMES, dev port, domains, public `vars`, store sizes, queues, crons, release channels, config values          |
| WHERE does it run and how is it packed? Would change if the company moved   | `runway.yaml` (root)             | accounts, zones, the shared Postgres server, cache, queue provider, VPC, EAS project, the topology groups and their sizes, `isolate`, defaults, edge, release policy |
| Which revision of another team's service contract do the clients use?       | `stackra.lock.yaml`              | producer to revision, once per workspace                                                                                                                             |
| Can it be derived from declarations?                                        | nowhere: `stackra gen` writes it | identities, one database per service and a Postgres schema per module, topics, entries, Vite/Metro/Expo/Electron config, wiring, migrations (`stackra db diff`)      |
| Is it a version?                                                            | `pnpm-workspace.yaml` catalogs   | every external and `@stackra/*` version; members say `catalog:<name>` or `workspace:*`                                                                               |

A package has no runway: publishing is `publishConfig` (with `exports` pointing at `dist`) plus a
changeset. A member file may override a root default, never the reverse. Secret values live only in
Infisical
([Stackra ADR 0173](https://docs.stackra.figentra.com/adr/0173-secrets-infisical-is-the-source-of-production-secrets));
files name them. Wrong place, for each row: a port number is runway, not config; a TTL is config,
not runway; the list of targets is `stackra.config.ts`; a group's cpu is the root runway, never a
member's; a column is the model, never a hand-written migration.

## How each member kind is created

| Kind    | Command                                              | What it writes                                                                                                                                               |
| ------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| project | `pnpm create stackra <name>`                         | this root, one example service, the console                                                                                                                  |
| service | `pnpm new service <name>`                            | `services/<name>/` with `stackra.config.ts` (`defineService`), `runway.yaml`, the root module `src/<key>.module.ts`, `assets/`, the boot test                |
| app     | `pnpm new app <name> --targets web,pwa,desktop`      | `apps/<name>/` with `stackra.config.ts` (`defineApp`), `runway.yaml`, the root module, `app.error.tsx`, `assets/`, `src/config/`                             |
| package | `pnpm new package <name> --category <c> --entries …` | `packages/<c>/<name>/` with `stackra.config.ts` (`definePackage`), the entry folders, the root module `src/node/<key>.module.ts`, `assets/`, `publishConfig` |
| module  | `pnpm new module <key>` (in a service or package)    | `src/modules/<key>/<key>.module.ts` + README; lang goes to the member's `assets/lang/<locale>/<key>.json`                                                    |

Nobody writes an entry, an entry barrel or a tool config: gen writes `.stackra/entry/<target>.ts`
(calling `createApp` from `@stackra/app/<target>`), the barrels, the Vite, Vitest, Playwright,
tsdown, Wrangler, Expo, EAS and Metro configs, and a gitignored shim at the member root for each
tool that reads only the root. `stackra.config.ts` keeps `defineApp` / `defineService` /
`definePackage`: it is static build input read from the syntax tree. A code hatch is a function
file, never an object in `stackra.config.ts`: `vite.extend.ts`, `expo.extend.ts`, `metro.extend.ts`
or `electron.extend.ts`, add-only and opening with a `Reason:` header.

## Choose

Where the template offers two valid shapes, this is the rule for picking one.

| Question                                     | Choose                                                                                                                      |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| A generated operation or a hand-written one? | `operations: { list: true }` on the resource while the standard one is enough; a query when the filter narrows by actor     |
| A workflow or an inline `handle`?            | `handle` for one step in one transaction; `return ctx.run(Workflow, input)` for several steps, a compensation or a call out |
| Query or action?                             | a query for a read with no transaction; an action for anything that changes state, or that must be audited and replayed     |
| `CrudService` method or a repository?        | a named read on the model's `CrudService(Model)`; `services/<name>.repository.ts` only for reads beyond it                  |
| Policy or precondition?                      | a policy for "may this principal touch this record"; a precondition for "may anyone run this now" (orders paused)           |
| A companion shape or `schemas/`?             | a companion `<Name>Input` while one file uses it; `schemas/<name>.schema.ts` once a second file imports it                  |
| Config, settings or flag?                    | config when it is deploy-time and the same for every tenant; settings when a tenant admin changes it; a flag for on/off     |
| An enum or a string?                         | an `Enum.of` for any closed set of house values; a string only where an identity is written, a `keyof`, a driver name       |
| A shared resource or `requires`?             | shared by default; `requires` with `dedicated: true` and a `reason` only when the member cannot share                       |

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

Vitest, `createMatcher`, `freezeClock` and `freezeIds` come from `@stackra/testing`; never import
`vitest` directly. Domain helpers come from the package that owns the concept:
`@stackra/container/testing` `createTestingModule(Root).useDrivers("memory").compile()`;
`@stackra/actions/testing` `run`, `fakeActionContext`; `@stackra/iam/testing` `actors`;
`@stackra/errors/testing` `refusal`, `toRefuseWith`; `@stackra/events/testing` `toEmit`,
`drainOutbox`; `@stackra/database/testing` `usePostgres`, `Factory` (models are built with
`XFactory.new().create()`); `@stackra/clients/testing`
`fakeClient(<client>, (fake) => fake.<path>.returns(v))` or `.throws(refusal(ref))`;
`@stackra/settings/testing` `fakeSettings`; `@stackra/queue/testing` `fakeQueue`, `toDeadLetter`;
`@stackra/feature-flags/testing` flag helpers; `@stackra/notifications/testing` `renderMail`,
`MemoryNotifier`; `@stackra/gen/testing` `toMatchManifest`, `expectBackwardCompatible`;
`@stackra/ui/testing` `render`; `@stackra/testing/native` for React Native.

### Services and packages (in a module)

`orders/…` is `services/commerce/src/modules/orders/`; a package's module is `src/node/`.

| Kind                                    | Group / suffix                                                                                           | Test                                                            | Example                                                                                           |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| root module + boot                      | `src/<key>.module.ts` (entry generated: `.stackra/entry/server.ts`)                                      | `src/__tests__/<key>.module.int.test.ts`                        | `services/commerce/src/__tests__/commerce.module.int.test.ts`                                     |
| module, settings                        | `modules/<key>/<key>.module.ts`, `<key>.settings.ts` (`extends Settings`)                                | covered by the boot test; settings faked with `fakeSettings`    | `orders/orders.module.ts`, `orders/orders.settings.ts`                                            |
| model, state machine                    | `models/*.model.ts`, `models/<model>.state-machine.ts`                                                   | none (a factory instead); through the action that transitions   | `orders/models/order.model.ts`, `orders/models/order.state-machine.ts`                            |
| bucket                                  | `models/*.bucket.ts` (`extends Bucket`)                                                                  | through the action that uploads                                 | `catalogue/models/product-images.bucket.ts`                                                       |
| enum                                    | `enums/*.enum.ts` (`Enum.of`)                                                                            | none                                                            | `orders/enums/order-status.enum.ts`                                                               |
| schema, response change                 | `schemas/*.schema.ts`, `schemas/<name>-<yyyy-mm>.change.ts`                                              | through action and contract tests                               | `orders/schemas/order-view.schema.ts`, `orders/schemas/order-view-2027-03.change.ts`              |
| error                                   | `errors/*.error.ts` (`extends Refusal`)                                                                  | `toRefuseWith(refusal(Refusals.x.y))` in the thrower's test     | `orders/errors/order-not-payable.error.ts`                                                        |
| migration                               | `database/migrations/NNNN-<name>.migration.ts` (`stackra db diff` output)                                | applied by the `.int` tier                                      | `orders/database/migrations/0002-add-order-paid-at.migration.ts`                                  |
| factory, seeder                         | `database/factories/<model>.factory.ts`, `database/seeders/{minimal,demo,test}.seeder.ts`                | none                                                            | `orders/database/factories/order.factory.ts`, `orders/database/seeders/demo.seeder.ts`            |
| action, job                             | `actions/*.action.ts` (a job is an action with `job: { queue, cron }`)                                   | `actions/__tests__/<name>.action.test.ts`                       | `orders/actions/cancel-order.action.ts`, `orders/actions/expire-unpaid-orders.action.ts`          |
| query                                   | `queries/*.query.ts`                                                                                     | `queries/__tests__/<name>.query.test.ts`                        | `orders/queries/list-orders.query.ts`                                                             |
| workflow, signal                        | `workflows/*.workflow.ts`, `workflows/*.signal.ts`                                                       | `workflows/__tests__/<name>.workflow.int.test.ts`               | `orders/workflows/create-order.workflow.ts`                                                       |
| service                                 | `services/*.service.ts` (`Service`, `CrudService(Model)`)                                                | `services/__tests__/<name>.service.test.ts`                     | `orders/services/order-pricing.service.ts`                                                        |
| permissions, policy                     | `access/<model>.permissions.ts`, `access/<model>.policy.ts`                                              | the `.contract` test; `access/__tests__/<model>.policy.test.ts` | `orders/access/order.permissions.ts`, `orders/access/order.policy.ts`                             |
| precondition, flag, entitlement, role   | `access/*.precondition.ts`, `access/*.flag.ts`, `access/*.entitlement.ts`, `access/*.role.ts`            | through the action that names it                                | `orders/access/accepting-orders.precondition.ts`, `catalogue/access/product-limit.entitlement.ts` |
| event, event version                    | `events/*.event.ts`, `events/<name>-v<n>.change.ts`                                                      | the `.contract` test                                            | `orders/events/order-paid.event.ts`, `loyalty-kit/src/node/events/points-earned-v1.change.ts`     |
| inbound webhook                         | `events/*.event.ts` (`extends WebhookEvent`) plus the listener that handles it                           | the listener's test                                             | `services/notifications/src/modules/messages/events/`                                             |
| listener                                | `listeners/*.listener.ts`                                                                                | `listeners/__tests__/<name>.listener.test.ts`                   | `orders/listeners/mark-order-paid.listener.ts`                                                    |
| extension point, extension, interceptor | `extensions/*.extension-point.ts`, `extensions/*.extension.ts`, `extensions/*.interceptor.ts`            | `extensions/__tests__/<name>.extension.test.ts`                 | `orders/extensions/order.extension-point.ts`, `loyalty/extensions/redeem-points.extension.ts`     |
| port, driver                            | `contracts/ports/*.port.ts` (package), `drivers/<prefix>-<port>.driver.ts`                               | `drivers/__tests__/<name>.driver.int.test.ts`                   | `loyalty-kit/src/contracts/ports/loyalty-ledger.port.ts`, `loyalty/drivers/`                      |
| resource, widget, document              | `resources/<model>/*.resource.ts`, `*.widget.ts`, `*.document.ts`                                        | the `.contract` test and the console e2e tier                   | `orders/resources/order/order.resource.ts`, `orders/resources/order/sales-today.document.ts`      |
| notification, mail body                 | `resources/<model>/<name>.notification.ts` with `<name>.mail.tsx` beside it                              | `resources/<model>/__tests__/<name>.notification.test.ts`       | `orders/resources/order/order-receipt.notification.ts`                                            |
| search                                  | the `@Searchable` facet on the model                                                                     | through the query that uses it                                  | `catalogue/models/product.model.ts`                                                               |
| AI                                      | `ai/*.skill.ts`, `ai/*.prompt.ts`, `ai/*.facts.ts`                                                       | `.stackra/gen/ai.ts` lists what became a tool                   | `orders/ai/`                                                                                      |
| class facet + explorer                  | a `createDecorator` facet and `<entry>/<pkg>.explorer.ts`                                                | the explorer's test                                             | `packages/security/access-log`                                                                    |
| type, constant, function                | `types/*.type.ts`, `constants/*.constant.ts`, `functions/*.function.ts` (`contracts/types/` when public) | through their users                                             | `packages/commerce/loyalty-kit/src/contracts/types/`                                              |
| fake, matcher, fixture (package)        | `testing/<name>.fake.ts`, `testing/<name>.matcher.ts` (`createMatcher`), `testing/<name>.fixture.ts`     | `testing/__tests__/<name>.matcher.test.ts`                      | `loyalty-kit/src/testing/`                                                                        |
| config                                  | `src/config/*.config.ts` (`extends Config`, or a `<Host><Base>` override)                                | compiled by the module test                                     | `services/commerce/src/config/loyalty-kit.config.ts`                                              |
| contract                                | `stackra.manifest.json` and `openapi.json` at the member root (generated, committed)                     | `src/__tests__/stackra-manifest.contract.test.ts`               | `services/commerce/stackra.manifest.json`                                                         |
| lang, asset                             | member root `assets/lang/<locale>/<ns>.json`, `assets/<kind>/<module>/`                                  | gen fails on a key missing in one locale                        | `services/commerce/assets/lang/en/orders.json`                                                    |

### Apps

| Kind                   | Group / suffix                                                                                            | Test                                                                          | Example                                                             |
| ---------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| root module            | `src/<key>.module.ts` (`extends Module`), `src/app.error.tsx`; entries generated in `.stackra/entry/`     | `src/__tests__/<key>.module.test.ts`                                          | `apps/console/src/console.module.ts`                                |
| panel                  | `panels/*.panel.ts` (`extends Panel({ path, area })`)                                                     | none; gen writes `Panels` into every member that references it                | `apps/console/src/panels/tenant-admin.panel.ts`                     |
| route, layout          | `routes/<name>/<name>.route.ts` or `<name>.layout.ts`, with `<name>.tsx` and `<name>.error.tsx`           | `routes/<name>/__tests__/<name>.route.test.tsx`, `.e2e.test.ts`, `.flow.yaml` | `apps/console/src/routes/quick-order/`                              |
| component              | `components/<name>/{<name>.tsx,index.ts}`                                                                 | `components/<name>/__tests__/<name>.test.tsx`                                 | `apps/web/src/components/product-card/`                             |
| store                  | `stores/*.store.ts` (`extends Store({ persist })`, the state as fields)                                   | `stores/__tests__/<name>.store.test.ts`                                       | `apps/console/src/stores/ui.store.ts`                               |
| menu, shortcut, bridge | `menus/*.menu.ts`, `shortcuts/*.shortcut.ts`, `bridges/*.bridge.ts` (desktop, only for an uncovered need) | `__tests__/` beside them                                                      | `apps/console/src/menus/app.menu.ts`, `apps/console/src/shortcuts/` |
| block, document        | `blocks/<name>/{<name>.block.ts,<name>.tsx}`, `documents/*.document.ts`                                   | `blocks/<name>/__tests__/`                                                    | `apps/mobile/src/blocks/promo-banner/`                              |
| analytics event        | `analytics/*.analytics-event.ts` (`extends AnalyticsEvent({ name })`)                                     | through the component that tracks it                                          | `apps/web/src/analytics/`                                           |
| flag                   | `flags/*.flag.ts` (`extends Flag`)                                                                        | through the component it gates                                                | `apps/web/src/flags/pricing-yearly-first.flag.ts`                   |
| React hook             | `hooks/use-*.ts` (two or more importers), else beside its route or component                              | `hooks/__tests__/use-<name>.test.ts`                                          | `apps/web/src/hooks/use-variant-choice.ts`                          |
| server helper (web)    | `<name>.server.ts` beside the route that runs it (takes `ctx`, never imports config)                      | `__tests__/` beside it                                                        | `apps/web/src/routes/`                                              |
| override               | `overrides/<owner>/<block-or-widget>.override.tsx` (a typed function, no decorator)                       | `__tests__/` beside it                                                        | `apps/<app>/src/overrides/<owner>/`                                 |
| enum                   | `enums/*.enum.ts` (only when one app uses the set)                                                        | none                                                                          | `apps/console/src/enums/density.enum.ts`                            |
| config, chrome         | `src/config/*.config.ts`, including `desktop.config.ts` and `chrome.config.ts` overrides                  | none                                                                          | `apps/console/src/config/desktop.config.ts`                         |

## Generated, never authored

`stackra gen` writes `.stackra/` in every member: the runtime entries
(`.stackra/entry/<target>.ts`), the Vite, Vitest, Playwright, tsdown, Wrangler, Metro, Expo and
Electron configs, and `.stackra/gen/*.ts`, imported only as `#stackra/<name>` (`clients`, `i18n`,
`assets`, `env`, `wiring`, `flags`, `queues`, `panels`, `slots`, `routes`, `manifest`, …). Every
`#stackra/*` import in this tree has its sample, and every sample is complete. Consumed services'
lang files are copied into `.stackra/lang/`, so an app never imports a service package. `.stackra/`
is fully gitignored; the committed contract is `stackra.manifest.json` and `openapi.json` at the
member root: consumers generate their clients from them, `stackra gen --check` fails when they are
stale or when an identity changed without `@Renamed`, and `apps/docs` publishes projections of them.

## Framework project vs product repository

`pnpm create stackra my-app` renders this shape with one example service. A larger product uses the
same generator: many `services/<name>`, private `@acme/*` packages for logic two of its services
share ([Stackra ADR 0259](https://docs.stackra.figentra.com/adr/0259-module-placement-three-homes),
home B), and the apps. Nothing in a service file differs between the two; the root runway's topology
decides whether services run as one process, in groups or one each.

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
| `example.acme.console`, `example.acme.mobile`, `acme-console`, `acme` | each app's `stackra.config.ts` (`name`, `scheme`, bundle ids), `apps/console/src/config/desktop.config.ts`, Maestro flows                                | your bundle ids and URL schemes                                               |
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
root and member `.gitignore` files with the committed `.stackra/` samples, and the pre-release step
in `.github/workflows/ci.yml` with `.github/scripts/preview-gate.mjs`.

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
2. `AGENTS.md` (grammar, group folders, kind table, dictionary and rules)
3. `services/commerce/src/modules/orders/README.md`, then `actions/create-order.action.ts` and
   `workflows/create-order.workflow.ts`
4. `services/commerce/src/modules/loyalty/extensions/redeem-points.extension.ts` (extending another
   module)
5. `services/commerce/.stackra/gen/wiring.ts`, `extensions.ts` and `stackra.manifest.json` (what gen
   derived and locked)
6. `services/notifications/README.md` (reaching another service: event, call, command)
7. `packages/commerce/loyalty-kit/README.md` (shapes index) and
   `packages/security/access-log/README.md` (a class facet)
8. `apps/console/README.md` (an app: route folders, flags, the generated entry), then `runway.yaml`
   (the topology) and `apps/console/runway.yaml`
9. `apps/docs/src/guides/add-a-field.mdx` (the first change every newcomer makes: a field from the
   model to the test)

## Licence

MIT, see [`LICENSE`](LICENSE). The bundled Stackra brand images, fonts and paid-licence code are
excluded, see [`NOTICE`](NOTICE). The Stackra and Figentra names and logos are trademarks of
Figentra Technologies L.L.C (`.github/assets/NOTICE`).
