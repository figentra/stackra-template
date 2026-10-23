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
tool configs for web, PWA, desktop and mobile. This repository is the monorepo that
`pnpm create stackra` will render, written in the programming model v3.1: two services, three apps,
three packages, five tooling presets and the docs site, each showing every file kind with its test.
The example product is **Acme**, a multi-tenant commerce platform: a staff console, a public
storefront, a mobile app, and the commerce and notifications services behind them.

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
   pnpm install:pro             # dependencies, git hooks (lefthook) and .mcp.json (`stackra mcp sync`);
                                # `pnpm install` inside Infisical for the HeroUI Pro licence token
   stackra agents setup         # once per machine: Stackra skills, sub-agents and guard hooks for your assistant
   pnpm gen && pnpm dev         # generate .stackra/ and run every member
   pnpm verify                  # the gate CI runs
   ```

3. Replace the example identity, see [Make it yours](#make-it-yours).

## Structure

| Path                               | What it holds                                                                |
| ---------------------------------- | ---------------------------------------------------------------------------- |
| `services/commerce`                | the feature service: catalogue, inventory, orders and loyalty modules        |
| `services/notifications`           | a consumer service: reaches commerce by event, call and command, never code  |
| `apps/console`                     | tenant console: web, PWA and desktop (Electron) from one source tree         |
| `apps/web`                         | public site and storefront: server-rendered on Workers, installable as a PWA |
| `apps/mobile`                      | Expo app for iOS and Android                                                 |
| `apps/docs`                        | Mintlify docs: guides, ADRs and the API reference generated from manifests   |
| `packages/commerce/loyalty-kit`    | a feature package: every kind a package can hold                             |
| `packages/security/access-log`     | a decorator package: the `@AccessLogged` class facet with its explorer       |
| `packages/design-system/theme`     | the Acme theme (`defineTheme`), rendered to web and native CSS               |
| `packages/tooling/*`               | TypeScript, oxlint, Vitest, tsdown and commitlint presets                    |
| `runway.yaml`, `stackra.lock.yaml` | infrastructure and topology; pinned external producer manifests              |

The full annotated tree is in [Tree](#tree) below.

## The programming model in one screen

The path says the kind, the base class is the kind, the type gives the shape and the names give
identity
([Stackra ADR 0294](https://docs.stackra.figentra.com/adr/0294-programming-model-v3-grammar-folders-identities-and-naming),
as amended by the programming model v3.1,
[Stackra ADR 0305](https://docs.stackra.figentra.com/adr/0305-programming-model-v3-1-names-partners-files-and-class-components)
to 0309, which [`AGENTS.md`](AGENTS.md) states for this project). An **action** is the unit of
behaviour. One class becomes an HTTP endpoint, an MCP tool, a typed client method and a permission
check:

```ts
// services/commerce/src/modules/orders/actions/cancel-order.action.ts (abridged)
export class CancelOrderAction extends Action({
  key: "order.cancel",
  actors: [ActorKind.User, ActorKind.Agent, ActorKind.Service],
  tool: true,
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
`orders.order.cancel` (its risk, L2, is on `OrderPermissions.cancel`, so the console asks for
confirmation), the route `PUT /orders/:orderId/cancel`, the MCP tool `orders_order_cancel`, and the
input and output schemas from the types of `handle`. `CancelOrderInput` and `CancelOrderOutput` are
their own files in `orders/schemas/`: every file exports exactly one declaration. A **model** is a
class; its field types are its columns, and traits add the public id, tenancy, timestamps, user
stamps and optimistic locking:

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

A **route** is a folder: the route class names its path, layout and tab, the page class beside it
(`quick-order.tsx`) is bound by name, and `submit` runs the action through the generated client,
whose classes are imported by name from `#stackra/clients/<service>`:

```ts
// apps/console/src/routes/quick-order/quick-order.route.ts (abridged)
export class QuickOrderRoute extends Route({
  path: "/quick-order",
  layout: ShellLayout,
  tab: {
    order: 2,
    icon: "zap",
  },
  flag: Flags.orders.quick_order,
}) {
  /** Places the order, then opens it in the orders resource; offline, the queue keeps it. */
  override async submit(ctx: RouteContext<this>) {
    const form = validate(QuickOrderForm, await ctx.formData());
    if (!form.success) return ctx.fieldErrors(form.error);
    const result = await ctx.action(CreateOrderAction, QuickOrderForm.toInput(form.data));
    if (!result.ok) return ctx.fieldErrors(result.error);
    if (result.queued) return null;
    return ctx.redirect(Resources.Order.view, { id: result.data.orderId });
  }
}
```

A **component** is a class too: fields are state, a field that calls a hook is a hook field, a
getter is a derived value, `mount()` and `unmount()` are the lifecycle, and gen compiles the class
to a React function component (`classComponents()` from `@stackra/gen/vite` in the generated Vite
config, `@stackra/gen/metro-transformer` in the generated Metro config):

```tsx
// apps/console/src/components/theme-toggle/theme-toggle.tsx (abridged)
export class ThemeToggle extends Component {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** The chosen scheme and the one it resolves to. */
  scheme = useColorScheme();

  /** Runs `CycleThemeShortcut`, the one owner of the cycle order. */
  cycle = useShortcut(CycleThemeShortcut);

  /** The chosen scheme's translated name. */
  get name() {
    return this.i18n.t(I18n.console.theme[this.scheme.scheme]);
  }

  /** The icon button. */
  render() {
    return (
      <Button
        isIconOnly
        aria-label={this.i18n.t(I18n.console.theme.toggle, { scheme: this.name })}
        onPress={this.cycle}
      >
        <Icon name={this.scheme.resolved === ColorScheme.Dark ? "moon" : "sun"} aria-hidden />
      </Button>
    );
  }
}
```

Strings appear only where an identity is written; every other reference is an imported class
(`CreateOrderAction`), a generated constant (`Flags.*`, `Routes.*`, `I18n.*`) or an enum value, and
an icon is an `IconName` string. The full model, with the group table, the kind table and the
dictionary, is in [`AGENTS.md`](AGENTS.md) and
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
> identity. Strings appear only where an identity is written; every reference is an imported class,
> a generated constant from `#stackra/*` or an enum value. One file, one declaration. Gen derives
> the identities and locks them in `stackra.manifest.json`, and writes the wiring, the entries and
> the tool configs. Actions are the only behaviour.**

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
├── mise.toml · .node-version     toolchain pins
├── .mcp.yaml                     every MCP server the project uses (Stackra local + hosted, docs and
│                                 tool servers); rendered to .mcp.json
├── .claude/launch.json           dev-server launch configuration for the assistant's preview
├── CLAUDE.md · CONTRIBUTING.md · SECURITY.md · LICENSE · NOTICE
├── apps/                         tier:app (apps/README.md)
│   ├── console/                  @acme/console: tenant console, targets web + pwa + desktop
│   │   ├── stackra.config.ts · runway.yaml · package.json · turbo.jsonc · tsconfig.json
│   │   ├── stackra.manifest.json  committed contract (generated): the gateway reads `consumes`
│   │   ├── assets/{lang/<locale>/<namespace>.json, public/logo.svg}   en, ar, en-US, ar-SA
│   │   ├── src/{config/, schemas/, panels/, routes/<name>/ (offline/ included),
│   │   │        components/<name>/, stores/, menus/, shortcuts/, blocks/<name>/, documents/,
│   │   │        hooks/, overrides/<owner>/, enums/, types/, styles/}   no root module file
│   │   └── .stackra/{entry/, gen/, vite.config.ts, vitest.config.ts, playwright.config.ts,
│   │                 index.html, sw.ts, pwa/, desktop/}   generated
│   ├── web/                      @acme/web: public site and storefront, targets web + pwa
│   │   │                         (React Router 7 on Workers, server-rendered)
│   │   ├── assets/{lang/<locale>/<namespace>.json, public/logo.svg}
│   │   ├── vite.extend.ts        the Vite hatch: add-only, opens with a `Reason:` header
│   │   ├── src/{config/, schemas/, routes/<name>/, components/<name>/, blocks/<name>/,
│   │   │        analytics/, flags/, hooks/, menus/, overrides/<owner>/, enums/, types/, styles/}
│   │   └── .stackra/{entry/, gen/, vite.config.ts, react-router.config.ts, wrangler.jsonc, …}
│   ├── mobile/                   @acme/mobile: Expo app, targets ios + android
│   │   ├── assets/{lang/<locale>/<namespace>.json, public/logo.svg}
│   │   ├── src/{mobile.module.ts (narrows the client modules), config/ (chrome.config.ts),
│   │   │        schemas/, routes/<name>/, components/<name>/, stores/, menus/ (tab-bar.menu.ts),
│   │   │        blocks/<name>/, documents/, analytics/, overrides/commerce/orders/, enums/,
│   │   │        types/, styles/, __tests__/}
│   │   └── .stackra/{entry/, gen/, app.config.ts, eas.json, metro.config.js, maestro/, …}
│   └── docs/                     @acme/docs: Mintlify; content root is src/ (docs.json, pages,
│                                 guides/, adr/, api-reference/, assets/)
├── packages/                     tier:lib, packages/<category>/<name> (packages/README.md)
│   ├── commerce/loyalty-kit/     @acme/loyalty-kit: the SHAPES CATALOGUE, every kind a package
│   │   │                         can hold
│   │   ├── assets/lang/<locale>/loyalty_kit.json
│   │   └── src/{config/, contracts/{ports,enums,types}/, core/, node/ (the module's groups,
│   │            database/macros/ included), react/<name>/, native/<name>/, testing/}
│   ├── security/access-log/      @acme/access-log: a DECORATOR package (the `@AccessLogged` class
│   │                             facet + its explorer, sink drivers, a retention job, the audit
│   │                             resource)
│   ├── design-system/theme/      @acme/theme: `ACME_THEME`, built with `defineTheme` from
│   │                             `@stackra/tokens` and rendered to themes/acme/web.css and
│   │                             themes/acme/native.css (Stackra ADR 0302)
│   └── tooling/                  tier:config presets: typescript, oxlint (boundaries), vitest,
│                                 tsdown, commitlint
└── services/                     tier:service (services/README.md)
    ├── commerce/                 @acme/service-commerce: the feature service
    │   ├── stackra.config.ts · runway.yaml · package.json · turbo.jsonc · tsconfig.json
    │   ├── stackra.manifest.json · openapi.json   committed contract (generated)
    │   ├── assets/{lang/<locale>/<module>.json, ai/orders/, public/orders/}
    │   ├── src/{config/, schemas/, __tests__/}   no root module file: gen derives it
    │   ├── src/modules/{orders,catalogue,inventory,loyalty}/<group>/   orders shows every
    │   │                                                               group (its README)
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
(`@stackra/navigation/router`) and no `@stackra/templates` (a mail body is a `.mail.tsx` class
component beside its notification). `@stackra/connections` is folded into `@stackra/integrations`,
every event base (`AnalyticsEvent` included) comes from `@stackra/events`, icons are `IconName`
strings from `@stackra/icons` rendered by `@stackra/ui`'s `Icon` (there is no `@stackra/ui/icons`),
and the example brand package `@acme/brand` is replaced by the theme package `@acme/theme` in the
`design-system` category
([Stackra ADR 0302](https://docs.stackra.figentra.com/adr/0302-stackra-design-system-tokens-ui-and-the-playground)).

## Which file owns which fact

One fact lives in exactly one file
([Stackra ADR 0295](https://docs.stackra.figentra.com/adr/0295-build-and-entry-stackra-config-generated-tool-configs-and-entries)
decision 4,
[Stackra ADR 0296](https://docs.stackra.figentra.com/adr/0296-runway-v3-member-requires-and-root-topology-groups)).
The test that places it:

| Question about the fact                                                     | File                             | Examples                                                                                                                                                             |
| --------------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What IS the member? Same in every environment, read only by build tools     | `stackra.config.ts` (member)     | `defineApp` / `defineService` / `definePackage`: targets, API area, env class, name, scheme, bundle ids, e2e seeds, health checks, tool sections                     |
| How does it BEHAVE while it runs? Would change if I shipped another product | `src/config/<fact>.config.ts`    | `Config({ schema, env })` classes (key derived), their `<Stem>Options` schemas and `Base`-alias overrides: TTLs, locales, PWA display, driver choices                |
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

### HeroUI Pro licence

The console builds on HeroUI Pro directly, `@heroui-pro/react`
([Stackra ADR 0197](https://docs.stackra.figentra.com/adr/0197-heroui-pro-is-used-only-in-our-own-apps)
as amended, stackra#127). Its postinstall downloads the licensed components, so installing the
workspace needs a HeroUI Pro licence token. **A team that copies this template needs its own HeroUI
Pro licence, or must replace the Pro components (the console shell, palette, sheet, KPI and empty
states) with the free `@stackra/ui` ones and drop `@heroui-pro/react`.**

The licence token is `HEROUI_PERSONAL_TOKEN` and lives only in Infisical. The postinstall reads only
`HEROUI_AUTH_TOKEN`, and without it exits 0 leaving an empty package, so both install paths expose
`HEROUI_PERSONAL_TOKEN` as `HEROUI_AUTH_TOKEN` for the install alone and run
`.github/scripts/heroui-pro.mjs`, which fails before the install when the token is missing and after
it when the components were not downloaded. Locally, `pnpm install:pro` runs `pnpm install` under
`infisical run --env=dev --path=/install`, a folder that holds that one token so no other value
reaches the dependencies' install scripts. In CI, release.yml exchanges the job's GitHub OIDC token
with Infisical for `HEROUI_PERSONAL_TOKEN` from `/ci` (repository variables
`INFISICAL_CI_IDENTITY_ID`, `INFISICAL_PROJECT_ID`, `INFISICAL_DOMAIN`) for the install step only,
then blanks it. There is no `.npmrc` with a value and no repository secret. The `heroui-pro` and
`heroui-native-pro` MCP servers in `.mcp.yaml` read the same token through `stackra mcp exec`, never
from a file. No Pro source is committed.

## How each member kind is created

| Kind    | Command                                              | What it writes                                                                                                                                               |
| ------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| project | `pnpm create stackra <name>`                         | this root, one example service, the console                                                                                                                  |
| service | `pnpm new service <name>`                            | `services/<name>/` with `stackra.config.ts` (`defineService`), `runway.yaml`, `src/config/`, `assets/`, the boot test (no module file: gen derives it)       |
| app     | `pnpm new app <name> --targets web,pwa,desktop`      | `apps/<name>/` with `stackra.config.ts` (`defineApp`), `runway.yaml`, `assets/lang/<locale>/<name>.json`, `src/config/` (the error boundary is navigation's) |
| package | `pnpm new package <name> --category <c> --entries …` | `packages/<c>/<name>/` with `stackra.config.ts` (`definePackage`), the entry folders, `assets/`, `publishConfig`; gen writes its `<Key>Module`               |
| module  | `pnpm new module <key>` (in a service or package)    | `src/modules/<key>/README.md`; lang goes to the member's `assets/lang/<locale>/<key>.json`; a module file only for `exports`                                 |

Nobody writes an entry, an entry barrel or a tool config: gen writes `.stackra/entry/<target>.ts`
(calling `createApp` from `@stackra/app/<target>`), the barrels, the Vite, Vitest, Playwright,
tsdown, Wrangler, Expo, EAS and Metro configs, and a gitignored shim at the member root for each
tool that reads only the root. `stackra.config.ts` keeps `defineApp` / `defineService` /
`definePackage`: it is static build input read from the syntax tree. A code hatch is a function
file, never an object in `stackra.config.ts`: `vite.extend.ts`, `expo.extend.ts`, `metro.extend.ts`
or `electron.extend.ts`, add-only and opening with a `Reason:` header.

## Choose

Where the template offers two valid shapes, this is the rule for picking one.

| Question                                     | Choose                                                                                                                                            |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| A generated operation or a hand-written one? | `operations: { list: true }` on the resource while the standard one is enough; a query when the filter narrows by actor                           |
| A workflow or an inline `handle`?            | `handle` for one step in one transaction; `return ctx.run(Workflow, input)` for several steps, a compensation or a call out                       |
| Query or action?                             | a query for a read with no transaction; an action for anything that changes state, or that must be audited and replayed                           |
| `CrudService` method or a repository?        | a named read on the model's `CrudService<Model>`; `services/<name>.repository.ts` only for reads beyond it                                        |
| Policy or precondition?                      | a policy for "may this principal touch this record"; a precondition for "may anyone run this now" (orders paused)                                 |
| Where does an Input or Output go?            | always `schemas/<name>-input.schema.ts` and `schemas/<name>-output.schema.ts`, also when one file uses it                                         |
| Extension, interceptor or event?             | an extension to change a value or refuse at a published slot; an interceptor to wrap a whole action call; a listener to react after it            |
| Query cache or the `Cache` port?             | the query's `cache:` for a read others call; the injected `Cache` port with `CacheKey.of(...)` for a value inside a service                       |
| Config override or `src/overrides/`?         | a config override (`extends BaseX`, in `src/config/`) to configure a package; `src/overrides/<owner>/…` to shadow its file                        |
| Config, settings or flag?                    | config when it is deploy-time and the same for every tenant; settings when a tenant admin changes it; a flag for on/off                           |
| An enum or a string?                         | an `Enum.of` for any closed set of house values; a string only where an identity is written, a `keyof`, a driver name                             |
| A shared resource or `requires`?             | shared by default; `requires` with `dedicated: true` and a `reason` only when the member cannot share (`services/commerce/runway.yaml` shows one) |

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
`fakeClient((fake) => fake.on(GetOrderQuery).returns(v))` or `.throws(refusal(XyError))`, asserted
with `client.called(GetOrderQuery)` (a queued call with `client.queued(CancelOrderAction)`);
`@stackra/settings/testing` `fakeSettings`; `@stackra/queue/testing` `fakeQueue`, `toDeadLetter`;
`@stackra/feature-flags/testing` flag helpers; `@stackra/notifications/testing` `renderMail`,
`MemoryNotifier`; `@stackra/gen/testing` `toMatchManifest`, `expectBackwardCompatible`;
`@stackra/ui/testing` `render`; `@stackra/testing/native` for React Native.

### Services and packages (in a module)

`orders/…` is `services/commerce/src/modules/orders/`; a package's module is `src/node/`.

| Kind                                    | Group / suffix                                                                                                           | Test                                                            | Example                                                                                           |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| boot                                    | no authored root module: gen derives it and writes `.stackra/entry/server.ts`                                            | `src/__tests__/<key>.module.int.test.ts`                        | `services/commerce/src/__tests__/commerce.module.int.test.ts`                                     |
| module, settings                        | `modules/<key>/<key>.module.ts` only for `exports`; `<key>.settings.ts` (`extends Settings`)                             | covered by the boot test; settings faked with `fakeSettings`    | `orders/orders.module.ts`, `orders/orders.settings.ts`                                            |
| model, state machine                    | `models/*.model.ts`, `models/<model>.state-machine.ts` (`StateMachine<Model>`)                                           | none (a factory instead); through the action that transitions   | `orders/models/order.model.ts`, `orders/models/order.state-machine.ts`                            |
| bucket                                  | `models/*.bucket.ts` (`extends Bucket`)                                                                                  | through the action that uploads                                 | `catalogue/models/product-images.bucket.ts`                                                       |
| enum                                    | `enums/*.enum.ts` (`Enum.of`)                                                                                            | none                                                            | `orders/enums/order-status.enum.ts`                                                               |
| schema (input, output, data, view)      | `schemas/<name>-input.schema.ts`, `<name>-output.schema.ts`, `<name>-data.schema.ts`, `<name>.schema.ts`                 | through action and contract tests                               | `orders/schemas/cancel-order-input.schema.ts`, `orders/schemas/order-view.schema.ts`              |
| response change                         | `schemas/<name>-<yyyy-mm>.change.ts` (`Change<View>({ date, sunset })`)                                                  | the `.contract` test                                            | `orders/schemas/order-view-2027-03.change.ts`                                                     |
| error                                   | `errors/*.error.ts` (`extends Refusal`)                                                                                  | `toRefuseWith(refusal(XyError))` in the thrower's test          | `orders/errors/order-not-payable.error.ts`                                                        |
| migration                               | `database/migrations/NNNN-<name>.migration.ts` (`stackra db diff` output, a frozen snapshot)                             | applied, rolled back and reapplied by `stackra db check`        | `orders/database/migrations/0002-add-order-paid-at.migration.ts`                                  |
| macro                                   | `database/macros/<name>.macro.ts` (`extends Macro`, gives `t.<name>()`)                                                  | `stackra db check` (its columns match its partner's)            | `access-log/src/node/database/macros/data-classification.macro.ts`                                |
| factory, seeder                         | `database/factories/<model>.factory.ts` (`Factory<Model>`), `database/seeders/{minimal,demo,test}.seeder.ts`             | none                                                            | `orders/database/factories/order.factory.ts`, `orders/database/seeders/demo.seeder.ts`            |
| action, job                             | `actions/*.action.ts` (surfaces `endpoint`, `tool`, `job`, `intent`; a job is `job: { queue, cron }`)                    | `actions/__tests__/<name>.action.test.ts`                       | `orders/actions/cancel-order.action.ts`, `orders/actions/expire-unpaid-orders.action.ts`          |
| query                                   | `queries/*.query.ts` (`cache: { ttl, invalidateOn }` when cached)                                                        | `queries/__tests__/<name>.query.test.ts`                        | `orders/queries/order-kpis.query.ts`                                                              |
| workflow, signal                        | `workflows/*.workflow.ts`, `workflows/*.signal.ts`                                                                       | `workflows/__tests__/<name>.workflow.int.test.ts`               | `orders/workflows/create-order.workflow.ts`                                                       |
| service                                 | `services/*.service.ts` (`Service`, `CrudService<Model>`)                                                                | `services/__tests__/<name>.service.test.ts`                     | `orders/services/order-pricing.service.ts`                                                        |
| permissions, policy                     | `access/<model>.permissions.ts`, `access/<model>.policy.ts` (`Policy<Model>`)                                            | the `.contract` test; `access/__tests__/<model>.policy.test.ts` | `orders/access/order.permissions.ts`, `orders/access/order.policy.ts`                             |
| precondition, flag, entitlement, role   | `access/*.precondition.ts`, `access/*.flag.ts`, `access/*.entitlement.ts`, `access/*.role.ts`                            | through the action that names it                                | `orders/access/accepting-orders.precondition.ts`, `catalogue/access/product-limit.entitlement.ts` |
| event, event version                    | `events/*.event.ts` (bases from `@stackra/events`), `events/<name>-v<n>.change.ts`                                       | the `.contract` test                                            | `orders/events/order-paid.event.ts`, `loyalty-kit/src/node/events/points-earned-v1.change.ts`     |
| integration, connection                 | `integrations/*.integration.ts`, `connections/*.connection.ts` (`Connection<Integration>`)                               | `connections/__tests__/<name>.connection.test.ts` (`check()`)   | `services/notifications/src/modules/messages/integrations/resend.integration.ts`                  |
| inbound webhook                         | `events/*.event.ts` (`WebhookEvent<Integration>({ type })`) plus the listener that handles it                            | the listener's test                                             | `services/notifications/src/modules/messages/events/`                                             |
| listener                                | `listeners/*.listener.ts`                                                                                                | `listeners/__tests__/<name>.listener.test.ts`                   | `orders/listeners/mark-order-paid.listener.ts`                                                    |
| extension point, extension, interceptor | `extensions/*.extension-point.ts`, `extensions/*.extension.ts` (`Extension<Point["slot"]>`), `*.interceptor.ts`          | `extensions/__tests__/<name>.extension.test.ts`                 | `orders/extensions/order.extension-point.ts`, `loyalty/extensions/redeem-points.extension.ts`     |
| port, driver                            | `contracts/ports/*.port.ts` (package), `drivers/<prefix>-<port>.driver.ts`                                               | `drivers/__tests__/<name>.driver.int.test.ts`                   | `loyalty-kit/src/contracts/ports/loyalty-ledger.port.ts`, `loyalty/drivers/`                      |
| resource, widget, document              | `resources/<model>/*.resource.ts` (`Resource<Model>`), `*.widget.ts` (`Widget<Query>`), `*.document.ts`                  | the `.contract` test and the console e2e tier                   | `orders/resources/order/order.resource.ts`, `orders/resources/order/order-kpis.widget.ts`         |
| notification, mail body                 | `resources/<model>/<name>.notification.ts` with `<name>.mail.tsx` beside it and its `schemas/<name>-data.schema.ts`      | `resources/<model>/__tests__/<name>.notification.test.ts`       | `orders/resources/order/order-receipt.notification.ts`                                            |
| search                                  | the `@Searchable` facet on the model                                                                                     | through the query that uses it                                  | `catalogue/models/product.model.ts`                                                               |
| AI                                      | `ai/*.skill.ts`, `ai/*.prompt.ts`, `ai/*.facts.ts` (`Facts<Model>`)                                                      | `.stackra/gen/ai.ts` lists what became a tool                   | `orders/ai/`                                                                                      |
| class facet + explorer                  | a `createDecorator` facet and `<entry>/<pkg>.explorer.ts`                                                                | the explorer's test                                             | `packages/security/access-log`                                                                    |
| type, constant, function                | `types/*.type.ts`, `constants/*.constant.ts`, `functions/*.function.ts` (`contracts/types/` when public)                 | through their users                                             | `packages/commerce/loyalty-kit/src/contracts/types/`                                              |
| fake, matcher, fixture (package)        | `testing/<name>.fake.ts`, `testing/<name>.matcher.ts` (`createMatcher`), `testing/<name>.fixture.ts`                     | `testing/__tests__/<name>.matcher.test.ts`                      | `loyalty-kit/src/testing/`                                                                        |
| config                                  | `src/config/*.config.ts` (`Config({ schema, env })`, or a `Base`-alias override) and its `<stem>-options.schema.ts`      | compiled by the boot test                                       | `services/commerce/src/config/loyalty-kit.config.ts`                                              |
| contract                                | `stackra.manifest.json` and `openapi.json` at the member root (generated, committed)                                     | `src/__tests__/stackra-manifest.contract.test.ts`               | `services/commerce/stackra.manifest.json`                                                         |
| lang, asset                             | member root `assets/lang/<locale>/<module>.json` (regional overlays hold only differing keys), `assets/<kind>/<module>/` | gen fails on a key missing in a base locale                     | `services/commerce/assets/lang/en/orders.json`                                                    |

### Apps

| Kind                   | Group / suffix                                                                                                             | Test                                                                          | Example                                                             |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| root module            | `src/<key>.module.ts` only to narrow client `imports` or `wrap`; entries generated in `.stackra/entry/`                    | `src/__tests__/<key>.module.test.ts`                                          | `apps/mobile/src/mobile.module.ts`                                  |
| panel                  | `panels/*.panel.ts` (`extends Panel({ path, area })`)                                                                      | none; gen writes `Panels` into every member that references it                | `apps/console/src/panels/tenant-admin.panel.ts`                     |
| route, layout          | `routes/<name>/<name>.route.ts` or `<name>.layout.ts`, the page class `<name>.tsx`, `<name>.error.tsx` only to customise   | `routes/<name>/__tests__/<name>.route.test.tsx`, `.e2e.test.ts`, `.flow.yaml` | `apps/console/src/routes/quick-order/`                              |
| component              | `components/<name>/{<name>.tsx,<name>.props.ts,index.ts}` (`extends Component<Props>`)                                     | `components/<name>/__tests__/<name>.test.tsx`                                 | `apps/web/src/components/product-card/`                             |
| store                  | `stores/*.store.ts` (`extends Store({ persist })`, the state as fields)                                                    | `stores/__tests__/<name>.store.test.ts`                                       | `apps/console/src/stores/ui.store.ts`                               |
| menu, shortcut, bridge | `menus/*.menu.ts`, `shortcuts/*.shortcut.ts`, `bridges/*.bridge.ts` (desktop, only for an uncovered need)                  | `__tests__/` beside them                                                      | `apps/console/src/menus/app.menu.ts`, `apps/console/src/shortcuts/` |
| block, document        | `blocks/<name>/{<name>.block.ts,<name>.tsx,<name>.props.ts}`, `documents/*.document.ts`                                    | `blocks/<name>/__tests__/`                                                    | `apps/mobile/src/blocks/promo-banner/`                              |
| analytics event        | `analytics/*.analytics-event.ts` (`extends AnalyticsEvent({ name })` from `@stackra/events`)                               | through the component that tracks it                                          | `apps/web/src/analytics/`                                           |
| flag                   | `flags/*.flag.ts` (`extends Flag`)                                                                                         | through the component it gates                                                | `apps/web/src/flags/pricing-yearly-first.flag.ts`                   |
| React hook             | `hooks/use-*.ts` (two or more importers), else beside its route or component; its result type in `types/`                  | `hooks/__tests__/use-<name>.test.ts`                                          | `apps/web/src/hooks/use-variant-choice.ts`                          |
| server helper (web)    | `<name>.server.ts` beside the route that runs it (takes `ctx`, never imports config)                                       | `__tests__/` beside it                                                        | `apps/web/src/routes/`                                              |
| override               | `src/overrides/<owner>/<owner's own path>`: same file name, same exported name, a `Base` alias for declarations            | `__tests__/` beside it                                                        | `apps/console/src/overrides/@acme/loyalty-kit/`                     |
| enum                   | `enums/*.enum.ts` (only when one app uses the set)                                                                         | none                                                                          | `apps/console/src/enums/density.enum.ts`                            |
| config, chrome         | `src/config/*.config.ts` with `src/schemas/<stem>-options.schema.ts`, including `desktop.config.ts` and `chrome.config.ts` | none                                                                          | `apps/console/src/config/desktop.config.ts`                         |

## Generated, never authored

`stackra gen` writes `.stackra/` in every member: the runtime entries
(`.stackra/entry/<target>.ts`), the Vite, Vitest, Playwright, tsdown, Wrangler, Metro, Expo and
Electron configs, and `.stackra/gen/*.ts`, imported only as `#stackra/<name>` (`i18n`, `assets`,
`env`, `wiring`, `flags`, `queues`, `panels`, `slots`, `routes`, `migrations`, `manifest`, …) or,
for a consumed service, as `#stackra/clients/<service>` (one file per service exporting its module,
action, query, event, enum and permission classes by name). Every `#stackra/*` import in this tree
has its sample, and every sample is complete. Consumed services' lang files are copied into
`.stackra/lang/`, so an app never imports a service package. `.stackra/` is fully gitignored; the
committed contract is `stackra.manifest.json` and `openapi.json` at the member root: consumers
generate their clients from them, `stackra gen --check` fails when they are stale or when an
identity changed without `@Renamed`, and `apps/docs` publishes projections of them.

Every generated file opens with the short header
`generated by stackra gen from <sources> — do not edit` and one `Purpose:` line, not the four-field
block an authored file carries; generated JSON puts the same two sentences in `$comment`. Strict
JSON files without a header are the recorded exceptions listed in `AGENTS.md` (Rules, the
generated-files item): `.github/rulesets/main.json`, `apps/docs/src/docs.json`, every
`package.json`, the lang files and the AI eval datasets.

## Languages and regions

Strings live in `assets/lang/<locale>/<namespace>.json` at each member's root: an app has its member
key plus one namespace per app group with strings (`shortcuts`, `manifest`, `pages`, `documents`),
and a service or package has one file per module key. `en` and `ar` are the base locales; the
regional overlays `en-US` and `ar-SA` hold only the keys that differ and fall back to their base
language, then to the default. Folders use BCP 47 case, URL prefixes stay lowercase (`/ar-sa/`,
[Stackra ADR 0297](https://docs.stackra.figentra.com/adr/0297-web-runtime-on-workers-prerender-caching-locale-urls-and-forwarding)).
The locale logic lives in three places, never in an app's own code: `@stackra/i18n` (the `Locale`
values, fallback resolution, number, date and money formatting, plural rules), the member's
`src/config/i18n.config.ts` (which locales and regions are enabled, the fallback chain, the URL
strategy) and `stackra gen` (merges the overlays and the consumed services' lang files into
`.stackra/lang/`, emits the typed `I18n` keys, and fails on a key missing from a base locale or an
overlay key its base lacks). An app changes a consumed module's strings in
`src/overrides/<service>/<module>/assets/lang/<locale>/<module>.json`, merged by key.

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
| product theme (Acme mark, blue accent)                                | `packages/design-system/theme` (`defineTheme`), `apps/*/assets/public/logo.svg`, `apps/docs/src/docs.json`                                               | your theme                                                                    |
| Stackra brand assets (all rights reserved)                            | `.github/assets/` (see its `NOTICE`), the README logo block, the brand line in `NOTICE`                                                                  | remove them, or keep them unmodified to say the project is built with Stackra |
| social preview image                                                  | `.github/assets/social-preview.png`, uploaded by hand under **Settings → General → Social preview**                                                      | your own image; GitHub has no file setting for it                             |
| `refs-issue-key` rule (off)                                           | `.commitlintrc.yaml`                                                                                                                                     | your tracker's prefix under `rules`, to require an issue-key footer           |
| `GITHUB_TOKEN` in the release job                                     | `.github/workflows/release.yml`                                                                                                                          | a GitHub App token if the version PR must run the gate                        |

Then import `.github/rulesets/main.json` (Settings → Rules → Rulesets), turn on private
vulnerability reporting (`SECURITY.md`), and install the Renovate app.

Template-only lines, removed in a real project once `@stackra/*` is published: `!.stackra/**` in the
root and member `.gitignore` files with the committed `.stackra/` samples, and the pre-release step
in `.github/workflows/ci.yml` with `.github/scripts/preview-gate.mjs`.

Secret values never go in a file: a config's options schema marks a field `@Secret("NAME")` (or its
`env` map names an environment variable), `runway.yaml` names the secret, and the value lives in
your secret store (Infisical by default, Stackra ADR 0173).

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
