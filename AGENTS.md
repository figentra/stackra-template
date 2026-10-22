<!--
Stackra file contract:
Purpose: the agent entry for a Stackra project; the glossary and the rules every agent reads first.
Boundary: vocabulary and placement only; procedures live in skills, the file-kind → test table
          and the test helpers in README.md.
Runtime: node
Governing contract: Stackra ADR 0264 (vocabulary, kind folders), 0263 (DI), 0265 (hooks), 0128 (one
                    declaration per file), 0007 (docblocks, amended), 0022 (tests), 0231 (naming),
                    0145 (define carve-out), 0140 (errors), 0208 (system roles)
-->

# Agent guide

## Glossary (one term = one meaning = one form = one folder)

Everything with identity is a class with a kind decorator, discovered by gen from its kind folder.
The define family is retired; the only remaining factory verbs are helpers (`createApp`,
`createDecorator`, `createMatcher`, `Schema`, `Enum.case`, `transform`, `verify`,
`override`) and the build-config carve-out `defineApp` / `defineService` in `stackra.config.ts`
(recorded beside [Stackra ADR 0145](https://docs.stackra.figentra.com/adr/0145-tokens-are-define-token-values-and-global-helpers-are-banned)).

A kind is marked by its folder plus exactly one form, and the table lists that form: a class
decorator, an `extends` clause, or nothing but the folder. There is no `@Injectable`: gen
discovers by folder and DI is by type. A listener needs no class decorator (its `@OnEvent` method
marks it) and a guard is marked by `extends Guard`.

| Term                 | Meaning                                                                                                             | Form                                                                                                                              | Folder                                                                                       | Not to be confused with                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Member               | A workspace package: app, service or package                                                                        | `package.json` + (app/service) `stackra.config.ts` + `runway.yaml`                                                                | `apps/<name>`, `services/<name>`, `packages/<category>/<name>`                               | Service (a deployable member)                                                                                    |
| Module               | A folder owning one feature; its key is the namespace for permissions, events, i18n, settings                       | `@Module({ key, exports })`                                                                                                       | `<key>.module.ts`                                                                            | a `@stackra/*` package; a module lives inside a service or a package                                             |
| App root             | What an app is made of: providers, panels, modules                                                                  | `@App({ … })`                                                                                                                     | `src/<key>.app.ts`                                                                           |                                                                                                                  |
| Model                | Persisted entity; traits by mixin; every column and index is declared here                                          | `@Model` + field decorators + `@Index` + `Model.with(HasPublicId("ord"), BelongsToTenant, …)`                                     | `models/`                                                                                    | a schema (a wire shape)                                                                                          |
| Model state          | The state family of one model field                                                                                 | `ModelState` and `Transition` classes from `@stackra/state-machine`; `@HasState` from `@stackra/model`                            | `states/<model>.state.ts`                                                                    |                                                                                                                  |
| Enum                 | A closed set of codes with labels                                                                                   | `class X extends Enum<X> { static readonly A = X.case("a", { label }) }` (`enum` keyword banned)                                  | `enums/`                                                                                     | a literal union typed by a tool (see the allowed strings below)                                                  |
| Schema               | A wire shape: value and type under one name; one exported schema per file                                           | `class X extends Schema(z.object({…})) {}`; `z` only from `@stackra/schema`                                                       | `schemas/`                                                                                   | a model (a table)                                                                                                |
| Error                | A typed refusal: category + snake_case code                                                                         | `class X extends AppError`, `category = ErrorCategory.X`; checked with `isRefusal(error, Refusals.x.y)`                           | `errors/`                                                                                    | `AppError` built inline                                                                                          |
| Action               | A state change with a short key (`order.cancel`; gen prefixes the module on the wire)                               | `@Action`                                                                                                                         | `actions/`                                                                                   | a client descriptor (`Commerce.actions.X`, the remote face of the same action), a bridge, a route `submit`       |
| Query                | A read with a short key, no transaction                                                                             | `@Query`                                                                                                                          | `queries/`                                                                                   |                                                                                                                  |
| Adapter              | How an action is reached                                                                                            | `@AsEndpoint` `@AsTool` `@AsJob` (+ `@Cron`)                                                                                      | on the action                                                                                |                                                                                                                  |
| Webhook              | A signed inbound receiver that is not an action (`@Controller` for any other raw endpoint)                          | `@Webhook` from `@stackra/webhooks`, area `ApiArea.Public`                                                                        | `webhooks/`                                                                                  | an outbound delivery, which is `@Event({ webhook: true })`                                                       |
| Module service       | An injectable class holding domain logic; `@Crud` generates standard actions                                        | class (+ `@Crud`)                                                                                                                 | `services/`                                                                                  | Service (a deployable): `services/<name>` is a deployable, `*.service.ts` is an injectable class inside a module |
| Service              | A deployable member                                                                                                 | root `@Module` + `src/main.ts` (`createApp(Root, { wiring })` from `@stackra/app/server`)                                         | `services/<name>/`                                                                           | a module service                                                                                                 |
| Client               | Generated typed caller of another service: call, `.queue`, events                                                   | `Commerce.actions.X` (apps), `CommerceClient` (services) from `#stackra/clients`                                                  | none (generated)                                                                             | the `@Action` it calls                                                                                           |
| Repository           | Data access for one model; a class only for named queries                                                           | `Repository<Model>` constructor type, or `@RepositoryOf(Model)`                                                                   | `repositories/` (optional)                                                                   |                                                                                                                  |
| Migration            | A schema step in the blueprint DSL; `stackra db diff` writes it from the models                                     | `class extends Migration { up(schema: Blueprint) }`                                                                               | `migrations/<nnnn>-<name>.migration.ts`                                                      |                                                                                                                  |
| Factory, Seeder      | Record builders with states; named data profiles (`<module>.<name>`, e.g. `orders.demo`)                            | `class extends Factory<Model>`, `class extends Seeder`                                                                            | `factories/`, `seeds/` (`*.seed.ts`)                                                         |                                                                                                                  |
| Policy, Guard        | Record-level decision per verb; a pipeline step before IAM                                                          | `@Policy(Model) implements PolicyFor<…>`; `class extends Guard`                                                                   | `policies/`, `guards/`                                                                       |                                                                                                                  |
| Permissions          | The permission catalogue of one resource; risk is declared here and nowhere else                                    | `@Permissions(Model)` class with `@Permission({ risk: Risk.L1 })` statics                                                         | `permissions/*.permission.ts`                                                                |                                                                                                                  |
| Entitlement          | A plan-gated capability a feature checks                                                                            | `@Entitlement` class                                                                                                              | `entitlements/*.entitlement.ts`                                                              |                                                                                                                  |
| Event                | A fact; `public: true` = integration event, `.v<n>` on the wire                                                     | `@Event` class; `@Version(2)` + `@Upcast` for a new major                                                                         | `events/`, `versions/`                                                                       | an analytics event, a domain event that never leaves the service                                                 |
| Response change      | A dated breaking response change                                                                                    | `@Change({ since })` class                                                                                                        | `versions/`                                                                                  |                                                                                                                  |
| Listener             | Reaction to an event                                                                                                | `@OnEvent(EventClass, { queue?, where? })` on a method                                                                            | `listeners/`                                                                                 |                                                                                                                  |
| Hook point           | Where other modules may transform or verify                                                                         | `@HookPoint` class `<Name>Hooks` with `transform` / `verify` properties                                                           | `hooks/<name>.hook-point.ts`                                                                 | a React hook (`use-*.ts`, never in a service)                                                                    |
| Hook                 | An implementation of a hook point                                                                                   | `@Hook(Point, { order })`                                                                                                         | `hooks/<name>.hook.ts`                                                                       | a hook point                                                                                                     |
| Workflow             | Multi-step, compensating or waiting work behind an action                                                           | `@Workflow()` class extends `WorkflowBase<In, Out>` + `@Step` methods                                                             | `workflows/`                                                                                 |                                                                                                                  |
| Settings, Flag       | Runtime per-scope values; a flag is a setting kind                                                                  | `@Settings({ scopes: [SettingScope.Tenant] })` + `@Setting` fields; `@Flag` (`@stackra/feature-flags`); read via `#stackra/flags` | `settings/` (`*.setting.ts`, `*.flag.ts`); an app's flags in `src/flags/`                    | Config (deploy-time)                                                                                             |
| Config               | Deploy-time behaviour; key `<member-key>.<name>` (packages: module key)                                             | `@Config("console.i18n")` class, field rules from `@stackra/validation` (`@OneOf`, `@Int`, `@Env`, `@Secret`, `@DriverOf`)        | `src/config/` (member)                                                                       | Settings (per tenant, runtime); `stackra.config.ts` (what the member is)                                         |
| Port                 | An abstract class that is its own DI token                                                                          | `export abstract class LoyaltyLedger`; `IdentityResolver`, `Actor` from `@stackra/contracts`                                      | `contracts/*.port.ts`                                                                        |                                                                                                                  |
| Driver               | One implementation of a port; config picks it by name                                                               | `@Driver(Port, "memory")`; a host replaces with `@Replaces(Port)`; named instances `@Named`                                       | `drivers/` (always)                                                                          | a DI binding (wiring calls those `bindings`)                                                                     |
| Link                 | A relation across modules                                                                                           | `@Link` class with `@Link({ relation: ManyToOne, to })` properties                                                                | `links/`                                                                                     |                                                                                                                  |
| Resource             | Panel CRUD screen for a model                                                                                       | `@Resource` class with `table(t)`, `form(f: FormBuilder)`, `infolist(i)`                                                          | `resources/`                                                                                 |                                                                                                                  |
| Widget, Document     | A panel tile bound to a query; an L2 screen composed of `Blocks.*`. One kind in services and apps                   | `@Widget`; `@Document({ key, realms: [Realm.X], blocks })`                                                                        | `widgets/`, `documents/`                                                                     |                                                                                                                  |
| Search index         | A model's searchable fields and filters                                                                             | `@SearchIndex(Model, { fields, filters })` class                                                                                  | `search/*.search.ts` (never `.index.ts`, which is a barrel)                                  | a barrel                                                                                                         |
| Override point       | A replaceable component or asset; the declaration                                                                   | `@OverridePoint` class named for the slot (`OrderStatusBadge`)                                                                    | `override-points/<name>.point.ts`                                                            | an override (the binding)                                                                                        |
| Override             | The binding of an override point in a consumer; foreign lang, mails and public files                                | `@Override(Point, { component })` class `<Name>Override`                                                                          | `overrides/<module>/components/<name>.override.tsx`                                          | an override point                                                                                                |
| Mail                 | A React Email message owned by its module                                                                           | `@Mail` class extends `Mailable<Props>`                                                                                           | `mails/*.mail.tsx`                                                                           |                                                                                                                  |
| AI                   | Skills, prompts and facts an agent reads                                                                            | `@Skill`, `@Prompt`, `@Facts({ for: Order })` class `OrderFacts` (returns `ContextFacts`)                                         | `ai/` (`*.facts.ts`)                                                                         | a DI provider, an app `@Provider`                                                                                |
| Integration          | A third-party connection a tenant configures                                                                        | `@Integration` class                                                                                                              | `integrations/*.integration.ts`                                                              |                                                                                                                  |
| Route, Layout        | An app screen and its frame; options are one shared `RouteOptions`; permission is derived from what the route calls | `@Route({ path, layout, prefetch \| loader, submits?, component })`; `@Layout({ kind: LayoutKind.X })`                            | `routes/`                                                                                    | a route's `submit(ctx)`, which is not an `@Action`                                                               |
| Page component       | The component a route renders                                                                                       | function typed `RouteComponent<typeof XRoute>`                                                                                    | `components/pages/<name>/`                                                                   |                                                                                                                  |
| Panel                | A mounted panel of an app, declared once; it hosts realms, and packages and services target realms                  | `@Panel({ key, path, realms })` class                                                                                             | `apps/<name>/src/panels/<name>.panel.ts`                                                     |                                                                                                                  |
| Provider, Store      | App-wide context; client state                                                                                      | `@Provider` class (only when it runs code before mount); `@Store` class extends `StoreBase`                                       | `providers/<name>/` (`<name>.provider.ts`, `<name>.context.tsx`, `use-<name>.ts`), `stores/` | a DI binding; a `.provider` file that is only a React context (that is `.context.tsx`)                           |
| Menu, Command, Block | Desktop menus, palette commands, L2 blocks an app contributes                                                       | `@Menu`, `@Command`, `@Block` classes                                                                                             | `menus/`, `commands/`, `blocks/`                                                             |                                                                                                                  |
| Bridge               | A call from the desktop renderer to the Electron main process                                                       | `@Bridge({ key, input, output, actors })` from `@stackra/platform/electron`, class `<Name>Bridge`                                 | `bridges/<name>.bridge.ts`                                                                   | an `@Action` (a service state change)                                                                            |
| Analytics event      | A tracked product event                                                                                             | `@AnalyticsEvent({ name })` class extends `AnalyticsEvent<Payload>`; `analytics.track(new X(p))`                                  | `analytics/<name>.event.ts`                                                                  | an `@Event` (a fact on the bus)                                                                                  |
| Asset                | A file shipped with a member (`<module>::<kind>/<path>`)                                                            | location; read via `#stackra/assets`, `#stackra/i18n`                                                                             | member root `assets/lang/<locale>/<ns>.json`, `assets/<kind>/`                               |                                                                                                                  |
| Generated            | What gen derives; never edited                                                                                      | `#stackra/<name>` imports (`clients`, `i18n`, `wiring`, `flags`, `queues`, `panels`, `slots`, …)                                  | `.stackra/gen/`                                                                              |                                                                                                                  |
| Test                 | Proof beside its subject                                                                                            | `@stackra/testing` + the owning package's `./testing`                                                                             | `<kind>/__tests__/`                                                                          |                                                                                                                  |

Singular suffix everywhere: `.permission.ts`, `.setting.ts`, `.hook-point.ts`, `.seed.ts`,
`.token.ts`. A class name stays plural where it holds a set (`OrderPermissions`, `OrderSettings`).
Kind folders for grouped declarations (`interfaces/`, `types/`, `functions/`, `constants/`,
`enums/`, `errors/`, `decorators/`) appear with their second file; the loyalty kit shows every
folder even with one file. There is no `features/`, `utils/`, `helpers/`, `dtos/`, `controllers/`,
`pages/` (in a service) or `screens/` folder.

### Member layout

A kit is a service module plus a runtime split: the kind folders under `node/` equal a service
module's, so a file moves between the two without relearning placement.

```text
services/<name>/src/modules/<key>/<kind>/      a service module
packages/<category>/<name>/src/node/<kind>/    a package: node/ holds the module's kind folders
packages/<category>/<name>/src/{core,react,testing}/<kind>/   isomorphic, React and test kinds
apps/<name>/src/<kind>/                        an app: routes/, components/, providers/, bridges/ …
```

### Action or query

Commands and queries are separate kinds (Stackra ADR 0098, 0155). Pick by what the call does:

|                 | Action (`@Action`, `actions/`)                                       | Query (`@Query`, `queries/`)                            |
| --------------- | -------------------------------------------------------------------- | ------------------------------------------------------- |
| Does            | changes state: create, update, transition, delete                    | reads; changes nothing                                  |
| HTTP            | `POST`, `PUT`, `PATCH` or `DELETE` through `@AsEndpoint`             | `GET` through `@AsEndpoint`                             |
| MCP             | only with `@AsTool` (a write opts in, with its risk)                 | an MCP tool automatically                               |
| Retries         | `Idempotency-Key` unless the verb is idempotent (`PUT`, `DELETE`)    | safe to repeat                                          |
| Offline         | may queue (`offline: { mode: OfflineMode.Queue }`) and replay        | the client shows its last persisted result              |
| Caching         | never cached                                                         | `cache: { ttl, invalidateOn }` on the server            |
| Long work       | `runs: SomeWorkflow` when it crosses modules or must compensate      | never; it answers from what is stored                   |
| Client UX       | `ux`: success, queued, confirm and what to open after                | none                                                    |

## Single owners (never import these from anywhere else)

`z`, `Schema`, `Enum` → `@stackra/schema` · `isRefusal`, `AppError`, `ErrorCategory` →
`@stackra/errors` (`refusal(ref)` from `@stackra/errors/testing`) · `hydrateEnv` →
`@stackra/config/env` · `Actor`, `ActorKind`, `HttpMethod`, `ApiArea`, `Target`, `IdentityResolver` →
`@stackra/contracts` · `Risk`, `SystemRole` → `@stackra/iam` · `UxAfter` → `@stackra/actions` ·
`Scope`, `DriverName` → `@stackra/container` · `SettingScope` → `@stackra/settings` · `QueryScope` →
`@stackra/query` · `StorageArea` → `@stackra/storage` · `ColorScheme` → `@stackra/theming` ·
`NumberingSystem`, `Locale` → `@stackra/i18n` · `PromptMoment`, `Capability`, `DesktopMode`, `OverlayStyle`, `OverlayAnchor` →
`@stackra/platform` · connectivity → `usePlatform().network` (`@stackra/platform` owns the PWA
service worker and network) · `Queues` → `#stackra/queues` · `Slots`, `Panels`, `Flags` →
`#stackra/*` · `RouteForm` → `@stackra/navigation/react` · brand CSS →
`@acme/brand/css/tokens.css` (web) and `/css/native.css` (mobile), referenced only as
`--brand-<group>-<name>`. Provider and component exports have unique names, so nothing is imported
under an alias.

## Rules

- **Strings appear only at four places.** Every other reference is a generated constant or a class
  enum (`Commerce.actions.CancelOrder`, `I18n.orders.status.paid`, `Panels.TenantAdmin`, `Risk.L2`,
  `ActorKind.User`, `HttpMethod.Put`); a string anywhere else is a type error or a
  `stackra/no-string-identity` lint error. The four are: (a) a declaration-site key
  (`@Action({ key: "order.cancel" })`); (b) a `keyof`-typed literal (`c.text("memberId")`,
  `compensate: "releaseStock"`); (c) a `DriverName<Port>` literal (`ledger: "postgres"`), checked
  against the drivers gen found; (d) a tool-owned value (an Electron `titleBarStyle`, a PWA
  `display`) typed by the tool's own union, with a docblock saying it is tool-owned. Every closed
  set of house values is a class enum in the package that owns the option, or under the app's
  `src/enums/` when only that app uses it; enum codes are snake_case.
- No `@1` in keys: version 1 until `@Version` says otherwise. No Stackra prefix in type names
  (`AppError`, `App`, `RuntimeConfig`).
- Links point down the graph: app shell ← layout ← route → page. A route names its layout and its
  page by class (`@Route({ path, layout: ShellLayout, component: DashboardPage })`); layouts, menus,
  frames, headers, pages and data never import a route class, they use its generated key
  (`Routes.dashboard` from `#stackra/routes`: `navigate.to(Routes.order_detail, params)`,
  `ctx.redirect(Routes.sign_in)`, `m.route(Routes.store)`). A layout has no `tabs:`; a route declares
  `tab: { order, icon, label }` and gen builds the tab and menu tables into `#stackra/navigation`.
  Planned lint rule: `no-upward-route-import`.
- One exported declaration per file, named for it, with its kind suffix ([Stackra ADR 0006](https://docs.stackra.figentra.com/adr/0006-naming-exports-and-imports),
  [Stackra ADR 0128](https://docs.stackra.figentra.com/adr/0128-code-conventions-enums-classes-components-and-kind-folders)). A
  component's `<Name>Props` and a hook's `<Name>State` are part of their declaration and stay in its
  file; a second runtime value is a second file.
- Never write a `providers` array, `forRoot`, `ConfigurableModuleBuilder`, `@Injectable()`, or an
  `@Inject` for a typed parameter: drivers self-register, config picks them, gen writes
  `#stackra/wiring`.
- Cross-module (same member): import only (1) a class the sibling's `@Module({ exports })` lists, to
  inject it; (2) its declarations — `events/`, `hooks/*.hook-point.ts`, `enums/`, `schemas/`,
  `errors/`, `permissions/`; (3) its model, inside `links/` only. Everything else in a sibling is
  internal; gen fails on the import. Carve-out: a test file (`__tests__/`) may also import a
  sibling's `factories/` and `models/` to arrange data. Cross-service: inject its generated client (call or `.queue()`)
  or listen to its events; never import its code or its package (an app gets a service's lang
  through gen's `.stackra/lang/` copy).
- Extension: implement a hook point or bind an override point. Never edit another module's file to
  change behaviour.
- One fact, one file: what a member IS → `stackra.config.ts`; how it BEHAVES →
  `src/config/*.config.ts`; how and where it RUNS → its `runway.yaml`; the infrastructure → the root
  `runway.yaml`; versions → `pnpm-workspace.yaml` catalogs. Risk lives on the permission, "who may
  run" in the action's `actors`, a driver choice in the `@DriverOf` field of the package that owns
  the port (runway `drivers` is its per-environment layer), a column or index on the model, health
  and targets in `stackra.config.ts`. Every member `package.json` declares exactly what its code and
  its generated code import.
- Apps and services have no authored entry beyond `createApp(Root, { wiring })`; app entries are
  generated (`.stackra/main.tsx`, `.stackra/main.ts`).
- Read `.stackra/gen/*.ts` to see what exists. It is the same file the code runs against, and it is
  complete.
- Config is read one way per place: constructor injection by type on the server, `useConfig(Class)`
  in React and React Native, `ctx.config(Class)` in route `loader`/`submit`/`guard`/`hydrate`. Never
  a static field read or a module-level read.
- Errors: `AppError` is built in object form (`new AppError({ category, code, retryable })`) or
  subclassed; `throw new Error` is banned in authored code, fakes and tests included.
- Tests: every test file sits in `__tests__/` beside its subject, `describe` takes the subject
  class; tests in services and packages use ids their factories return, and app tests use the
  fixture ids the seeds publish (`ord_01JA…`, `usr_01JA…`). Vitest comes only from `@stackra/testing`, never
  directly; the helpers for each concern are in README.md ("Test header and helpers"). Unit tests
  use memory drivers; `.int.test.ts` uses `usePostgres()`; every e2e test runs axe.
- Docblocks ([Stackra ADR 0007](https://docs.stackra.figentra.com/adr/0007-source-documentation-standard) as amended): every authored file opens with the contract block (Purpose,
  Boundary, Runtime, Governing contract); `Runtime` is exactly one of node, browser, worker,
  react-native, isomorphic, and anything in parentheses goes into Boundary; `Governing contract`
  lists published ADR numbers or a published standard page only, never an unpublished document. A generated file opens with `generated by stackra gen from <sources> — do not edit`,
  then Purpose, Boundary, Runtime. Every exported symbol, public member and config field has TSDoc
  saying what the type cannot (config fields add `@defaultValue`); tests carry a docblock on every
  `describe` and `it` saying why the case matters. `// why`, never `// what`.
- Naming ([Stackra ADR 0231](https://docs.stackra.figentra.com/adr/0231-naming-and-casing-standard)): module keys one snake_case segment; source keys short (`order.cancel`), wire
  keys `<module>.<resource>.<verb>`, unique per member whatever their area; verbs `get`, `list`,
  `search`, `stats`, qualifier last; events `<module>.<aggregate>.<verb>.v<n>` on the wire; codes,
  route keys and panel keys snake_case; files kebab-case with a singular kind suffix; constants
  SCREAMING_SNAKE; namespace lookups `<module>::<path>`; secrets `<PROVIDER>_<PURPOSE>`.

## Commands

Every repo operation is a `stackra` command behind a root script: `pnpm gen` (after any declaration change; commit
the member's `.stackra/app-manifest.json` and a service's `openapi.json`), `pnpm new <kind> <name>`, `pnpm verify`
(the gate CI runs), `pnpm validate`, `pnpm structure` (the kind → folder → test table), `pnpm db:diff`,
`pnpm run doctor` (`run`, because `pnpm doctor` is pnpm's own command). Agent skills, sub-agents, rules and guard hooks are not in this repository: install them once per
machine with `stackra agents setup` (`@stackra/skills`), and read framework know-how through the Stackra MCP server
in `.mcp.yaml`.
