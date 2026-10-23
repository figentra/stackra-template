<!--
Stackra file contract:
Purpose: the agent entry for a Stackra project: the grammar, the group folders, the kind table, the
         derived identities, the dictionary and the rules every agent reads first.
Boundary: vocabulary and placement only; procedures live in skills, the file-kind → test table and
          the test helpers in README.md, the worked guide in apps/docs/src/guides.
Runtime: node
Governing contract: Stackra ADR 0294 (grammar R1 to R12, group folders, kind table, identities,
                    dictionary), 0295 (build and entry), 0296 (runway), 0300 (presets, spelling),
                    0022 (tests), 0007 (docblocks, amended), 0231 (naming), 0140 (errors), 0208
                    (system roles)
-->

# Agent guide

The programming model is v3
([Stackra ADR 0294](https://docs.stackra.figentra.com/adr/0294-programming-model-v3-grammar-folders-identities-and-naming)).
In one line: **the path says the kind, the base class is the kind, the type gives the shape, and the
names give identity; gen derives and locks the rest in `stackra.manifest.json`.**

## Grammar

| Rule | Says                                                                                                                                                                                                                                                                                                       |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1   | The path says the kind: `<scope>/<group>/<name>.<kind>.ts(x)`, or `<scope>/<group>/<name>/<name>.<kind>.ts(x)` for a folder kind (route, block, component). Each suffix has one home group. `.change.ts` sits beside its subject. Tests sit in `__tests__/` beside their subject.                          |
| R2   | One primary export per file, named from the file: `cancel-order.action.ts` exports `CancelOrderAction`. Noun kinds (model, schema, enum, event, signal, analytics event, type) take no suffix; errors end in `Error`. Companions only: `<Name>Input`/`<Name>Output`, `<Name>Props`, `<Name>Data`.          |
| R3   | The base class is the kind and its options are the argument: `extends Action({ key })`, bare `extends Signal`. No kind decorators. A member that replaces a base default is marked `override`; an abstract member (`handle`, `definition`, `check`) is not.                                                |
| R4   | The TypeScript type gives the shape: rule, column and wire type. The initializer is the default, `?:` optional, `\| null` nullable; a `number` carries `@Int` or `@Num`. Gen compiles shapes to Zod and models to MikroORM metadata, so nobody writes Zod (`@Field(zod)` is the one hatch, with a reason). |
| R5   | Names give identity. Written once: an action or query `key`, an event `name`, an analytics event `name`, a route `path`, a custom endpoint path. Everything else is derived and locked; a change needs `@Renamed(old)`.                                                                                    |
| R6   | Decorators are field (`@Str`, `@Int`, `@Num`, `@List`, `@Trim`, `@Lowercase`, `@Hidden`, `@Visible`, relations, `@Env`, `@Secret`, `@Setting`, `@Renamed`, `@Field`), method (`@Step`, `@Transition`) or class facet (`@Index`, `@Searchable`, `@Auditable`, `@AccessLogged`, `@Lifetime`, `@Replaces`).   |
| R7   | Function kinds are never classes: components (`.tsx`), React hooks (`use-<name>.ts`), `functions/<name>.function.ts`, `<name>.server.ts`, `.mail.tsx`.                                                                                                                                                     |
| R8   | A type that serves one declaration stays in its file; a second importer moves it to `types/<name>.type.ts`. Enums always get their own file. No anonymous object type of two or more members in an exported signature.                                                                                     |
| R9   | One blank line between class members; an object of two or more properties in decorator or base-factory arguments goes one property per line. Every file opens with the four-field header; every member has a one-line TSDoc.                                                                               |
| R10  | `.stackra/` is generated and fully gitignored. The committed contracts sit at the member root: `stackra.manifest.json` and `openapi.json`. A tool that reads only the member root reads a gitignored shim there.                                                                                           |
| R11  | Inside a decorator a model is a thunk (`@ManyToOne(() => Variant)`); only a base factory's first argument is a bare model (`Resource(Order)`, `CrudService(Order)`). Same module: `Ref<T>` or `Collection<T>` with a foreign key. Another module: `Link<T>`, an indexed id with no foreign key.            |
| R12  | Every member authors `stackra.config.ts` and one root module, `src/<key>.module.ts` (`src/node/<key>.module.ts` in a package). Nobody writes `main.ts`, an `*.app.ts` or an entry barrel. Exempt: `apps/docs` and the `packages/tooling` presets.                                                          |

## Group folders

A module is `src/modules/<key>/` in a service and `src/node/` in a package. A group folder appears
with its first file.

| Group                                | Holds                                                                                          |
| ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| (module root)                        | `<key>.module.ts`, `<key>.settings.ts` (one per module), `README.md`                           |
| `models/`                            | `.model.ts`, `.state-machine.ts`, `.bucket.ts`, `.projection.ts`                               |
| `actions/`, `queries/`               | `.action.ts`, `.query.ts`                                                                      |
| `schemas/`                           | `.schema.ts` (a shape two or more files use), `.change.ts` (a dated response change)           |
| `enums/`, `errors/`                  | `.enum.ts`, `.error.ts`                                                                        |
| `events/`                            | `.event.ts`, `.change.ts` (an event version beside its event)                                  |
| `listeners/`                         | `.listener.ts`                                                                                 |
| `workflows/`                         | `.workflow.ts`, `.signal.ts`                                                                   |
| `access/`                            | `.permissions.ts`, `.policy.ts`, `.role.ts`, `.entitlement.ts`, `.precondition.ts`, `.flag.ts` |
| `services/`                          | `.service.ts`, `.repository.ts` (only for named reads beyond `CrudService`)                    |
| `drivers/`                           | `.driver.ts`                                                                                   |
| `extensions/`                        | `.extension-point.ts`, `.extension.ts`, `.interceptor.ts`                                      |
| `raw/`                               | `.controller.ts` (a service only: `/api/auth/*` or a stream)                                   |
| `resources/<model>/`                 | `.resource.ts`, `.widget.ts`, `.document.ts`, `.notification.ts`, `.mail.tsx`                  |
| `database/migrations/`               | `NNNN-<name>.migration.ts`, numbered per module from `0001`                                    |
| `database/factories/`                | `<model>.factory.ts`                                                                           |
| `database/seeders/`                  | `minimal.seeder.ts`, `demo.seeder.ts`, `test.seeder.ts`                                        |
| `ai/`                                | `.prompt.ts`, `.skill.ts`, `.facts.ts`                                                         |
| `functions/`, `constants/`, `types/` | `.function.ts`, `.constant.ts`, `.type.ts`                                                     |

An app's `src/` holds `<key>.module.ts` and `app.error.tsx` at its root; `config/` (`.config.ts`,
including `desktop.config.ts` and `chrome.config.ts`); `panels/`, `menus/`, `shortcuts/`,
`documents/`, `stores/`, `flags/`, `analytics/` (`.analytics-event.ts`) and `bridges/`;
`routes/<name>/` (`<name>.route.ts` or `<name>.layout.ts`, `<name>.tsx`, optional
`<name>.error.tsx`, `<name>.fallback.tsx`, `<name>.server.ts`, `use-<name>.ts`); `blocks/<name>/`
(`<name>.block.ts`, `<name>.tsx`, optional `<name>.native.tsx`); `components/<name>/` (`<name>.tsx`,
`index.ts` with the component and its Props only); `hooks/` (a `use-<name>.ts` with two or more
importers); `overrides/<owner>/` (`<block-or-widget>.override.tsx`); `providers/<name>/` (only for
the `Module({ wrap })` hatch); `enums/`, `types/`, `styles/`; and `schemas/` and `errors/` for the
app's own shapes (route form inputs, nested config objects, bridge inputs) and refusals.

A package's `src/` holds `contracts/` (the leaf: `ports/`, `enums/`, `types/`), `config/`, `core/`
(isomorphic services, drivers, errors, functions, schemas, blocks), `node/` (the module, with the
groups above), `react/<name>/`, `native/<name>/`, `testing/` (`fakes/`, `matchers/`) and
`<entry>/<pkg>.explorer.ts` only when it ships decorators. Dependencies run contracts ← core ← node,
react, native ← testing; the entry barrels are generated.

There is no `links/`, `guards/`, `hooks/` (in a service), `states/`, `repositories/`,
`override-points/`, `mails/`, `versions/`, `seeds/`, `permissions/`, `policies/`, `settings/`,
`commands/`, `features/`, `utils/`, `helpers/`, `dtos/` or `screens/` folder.

## Kind table

Every kind is declared by its base class. "Binding" says whether the container registers the class
(gen prints it in `wiring.ts`).

| Kind                       | Declared as                                                                                                                  | Binding    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Module                     | `extends Module` or `Module({ exports, imports, wrap })`; `imports` on roots, `wrap` on app roots                            | no         |
| Settings                   | `extends Settings({ scopes })`, one per module                                                                               | no         |
| Model                      | `extends Model.with(...traits)`                                                                                              | no         |
| State machine              | `extends StateMachine(Model, { field })`, one `@Transition` method per transition                                            | yes        |
| Schema                     | `extends Schema`, `CursorInput` or `Page.of(X)`; built with `X.create({...})`, never `new`                                   | no         |
| Enum                       | `export const X = Enum.of({...})` plus `export type X = Enum.Value<typeof X>`                                                | no         |
| Error                      | `extends Refusal({ kind: ErrorKind.X })`, details as fields; thrown as `X.create({...})`                                     | no         |
| Action, query              | `extends Action({ key, ... })`, `extends Query({ key, ... })`; input and output are the types of `handle`                    | yes        |
| Event                      | `extends DomainEvent`, `IntegrationEvent({ name, version, webhook, broadcast })` or `WebhookEvent({ path, scheme, secret })` | no         |
| Change                     | `extends Change(Subject, { from, sunset })` (event version) or `Change(Subject, { date, sunset })` (response)                | no         |
| Listener                   | `extends Listener` or `Listener({ queue, retry })`; `handle(event: E, ctx)` subscribes to `E`                                | yes        |
| Workflow, signal           | `extends Workflow({ startOn, correlate, timeout })` or `Workflow<Input>({ timeout })`; `extends Signal`                      | yes, no    |
| Permissions, policy, role  | `extends Permissions` (`static readonly cancel = Permission.L2`), `Policy(XPermissions)`, `Role({ grants })`                 | no, yes    |
| Precondition               | `extends Precondition`, with `check(ctx)`                                                                                    | yes        |
| Entitlement, flag          | `extends Entitlement({ kind, counts })`, `extends Flag({ default, scopes, expires })`                                        | no         |
| Service                    | `extends CrudService(Model)` or `extends Service`                                                                            | yes        |
| Port, driver               | `abstract class X extends Port` (packages), `extends Driver(Port)` named by its file prefix                                  | token, yes |
| Extension point, extension | `extends ExtensionPoint` (`ExtensionPoint.transform<T>()`, `.verify<T>()`), `extends Extension(Point, { order })`            | no, yes    |
| Interceptor, controller    | `extends Interceptor` (`intercept(ctx, next)`), `extends Controller({ path })` (raw HTTP only)                               | yes        |
| Resource                   | `extends Resource(Model, { area, navigation, operations })`                                                                  | yes        |
| Widget, document           | `extends Widget({ slot, query, display })` or `Widget.place(Base, {...})`; `extends Document({ kind, path, blocks })`        | no         |
| Notification               | `extends Notification({ category })`, `recipients(event)` and one method per channel; the body is `<stem>.mail.tsx`          | yes        |
| Migration, factory, seeder | `extends Migration`, `extends Factory(Model)`, `extends Seeder`                                                              | no         |
| Prompt, skill, facts       | `extends Prompt`, `extends Skill({ tools })`, `extends Facts(Model)`                                                         | yes        |
| Route, layout              | `extends Route({ path, layout, tab, flag })` or `Layout({...})`, with `override loader`, `submit`, `meta`                    | yes        |
| Panel, menu, shortcut      | `extends Panel({ path, area })`, `Menu({ kind: MenuKind.App })` with `items(m)`, `Shortcut({ keys })`                        | yes        |
| Store, block, bridge       | `extends Store({ persist })`, `Block({ category, icon })`, `Bridge({ capability })`                                          | yes        |
| Analytics event            | `extends AnalyticsEvent({ name })`, tracked as `analytics.track(X.create({...}))`                                            | no         |
| Config                     | `extends Config`, or a host override `<Host><Base> extends Base` with `override` members only                                | token      |

## Derived identities

Gen derives these and locks them in `stackra.manifest.json`; `stackra gen --check` fails on a change
without `@Renamed(old)`.

| Identity               | Formula                                                                                         | Example                                |
| ---------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------- |
| Member key             | package name without scope and tier prefix, snake_case                                          | `commerce`, `loyalty_kit`              |
| Module key             | folder name, snake_case                                                                         | `orders`                               |
| Model key, table       | `<module>.<snake(Class)>`; the plural table in the module's Postgres schema                     | `orders.order_line`, `orders.orders`   |
| Permission             | `<module>.<snake(class minus "Permissions")>.<static>`                                          | `orders.order.cancel`                  |
| Role, flag             | `<module>.<snake(class minus suffix)>`                                                          | `orders.quick_order`                   |
| Config key             | the member key for the file named after it, else `<member>.<snake(stem)>`; an override inherits | `commerce`, `commerce.rate_limit`      |
| Error code             | `snake(class minus "Error")`                                                                    | `order_not_payable`                    |
| Action or query key    | `<module>.` + `key` + `@<major>`                                                                | `orders.order.cancel@1`                |
| Integration event      | `<module>.` + `name` + `.v<n>`; a domain event carries no version                               | `orders.order.paid.v1`                 |
| Notification, template | `<module>.<snake(class minus "Notification")>`; `<module>::<notification>.<channel>`            | `orders::order_receipt.mail.subject`   |
| Seeder                 | `<module>.<profile>`                                                                            | `orders.demo`                          |
| i18n default keys      | `<module>::<kind>.<name>.<part>`                                                                | `orders::actions.order.cancel.confirm` |

Endpoints follow the key: `x.list` → `GET /xs`, `x.get` → `GET /xs/:xId`, `x.create` → `POST /xs`,
`x.update` → `PATCH /xs/:xId`, `x.delete` → `DELETE /xs/:xId`, any other verb →
`PUT /xs/:xId/<verb>` (input has `xId`) or `POST /xs/<verb>`, any other query → `GET /xs/<name>`.
`endpoint: { method, path }` keeps a path the convention would not give; `endpoint: false` removes
it.

## Words that mean one thing

| Word                       | Means only                                                                | Retired or not this                                          |
| -------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Member, module, entry      | a workspace member; a folder with `<key>.module.ts`; a package subpath    | `@App`, `@Service`                                           |
| Action, query              | a write; a read (L0 to L1, GET, cacheable, an MCP tool)                   | a route's `submit()` is not an action                        |
| Command                    | a CLI command only                                                        | palette and key entries are Shortcuts (`@stackra/shortcuts`) |
| Job                        | an action run from a queue or a cron (`job:` option)                      | not a kind                                                   |
| Precondition               | whether a call may run now, whoever asks                                  | Guard, Gate                                                  |
| Policy, permission, role   | record rules per verb; a grantable right with its risk; a bundle          | never a precondition                                         |
| Realm, area, scope         | an actor population; `ApiArea`; a settings or IAM scope                   | `Realm.TenantAdmin`; a DI lifetime is a `Lifetime`           |
| Extension point, extension | a typed place to transform or refuse a value; one implementer             | backend "hook" and "hook point"                              |
| Override, replacement      | swaps a block, Custom widget renderer or asset by path; `@Replaces(Port)` | the override-point kind                                      |
| Hook, provider             | React only: a `use*` function; a React context component                  | DI providers are bindings; `@ContextProvider` is `Facts`     |
| Port, driver, adapter      | an abstract contract class; its implementation; generated glue only       | —                                                            |
| Token                      | the class itself                                                          | `defineToken`, string tokens, `@Inject`                      |
| Model, schema, view, link  | a persisted entity; a wire shape; an output `<X>View`; `Link<T>`          | `@Link`, `links/`                                            |
| State machine, transition  | a model field's lifecycle class; one of its methods                       | `states/`                                                    |
| Config, settings           | deploy-time configuration; tenant runtime settings                        | —                                                            |
| Notification, toast        | a message to people; a transient in-app message                           | `@stackra/mail` is `@stackra/notifications`                  |
| Change                     | a versioned conversion of an event or a response (`up`, `down`)           | `@Upcast`                                                    |
| Migration, factory, seeder | Laravel meanings; profiles are minimal, demo and test                     | "fetchers"                                                   |
| `stackra.manifest.json`    | the member contract, committed at the member root                         | `app-manifest.json`                                          |

## Action or query

|           | Action (`actions/`, `extends Action`)                                 | Query (`queries/`, `extends Query`)        |
| --------- | --------------------------------------------------------------------- | ------------------------------------------ |
| Does      | changes state: create, update, transition, delete                     | reads; changes nothing                     |
| HTTP      | `POST`, `PUT`, `PATCH` or `DELETE` by the endpoint convention         | `GET` by the endpoint convention           |
| MCP       | only with `tool: true` (a write opts in, with its risk)               | an MCP tool automatically                  |
| Retries   | `Idempotency-Key` unless the verb is idempotent                       | safe to repeat                             |
| Offline   | may queue (`offline: { mode: OfflineMode.Queue }`) and replay         | the client shows its last persisted result |
| Caching   | never cached                                                          | `cache: { ttl, invalidateOn }`             |
| Long work | `handle` returns `ctx.run(Workflow, input)` for several steps         | never; it answers from what is stored      |
| Client UX | `ux`: `confirm: Tone.X`, `after: [UxAfter.X]`; texts are derived keys | none                                       |

## Single owners (never import these from anywhere else)

`Module`, `Service`, `Controller`, `defineService`, `defineApp` → `@stackra/app` · `Action`,
`Query`, `Precondition`, `Interceptor`, `ExtensionPoint`, `Extension`, `UxAfter` →
`@stackra/actions` · `Schema`, `CursorInput`, `Page`, `Enum`, `validate` and the field decorators →
`@stackra/validation` · `Model`, relation decorators, `Collection`, `Ref`, `Link`, `Index`,
`Searchable` → `@stackra/model` (traits from `@stackra/model/traits`) · `StateMachine`, `Transition`
→ `@stackra/state-machine` · `Refusal`, `ErrorKind` → `@stackra/errors` · `DomainEvent`,
`IntegrationEvent`, `WebhookEvent`, `Listener` → `@stackra/events` · `Change` →
`@stackra/versioning` · `Workflow`, `Signal`, `Step`, `Run` → `@stackra/workflow` · `Permissions`,
`Permission`, `Policy`, `Role`, `SystemRole` → `@stackra/iam` · `Entitlement` →
`@stackra/entitlements` · `Flag` → `@stackra/feature-flags` · `Settings`, `Setting`, `SettingScope`
→ `@stackra/settings` · `CrudService`, `Migration`, `Seeder` → `@stackra/database` (`Factory` from
`@stackra/database/testing`) · `Driver`, `Port`, `Lifetime`, `Replaces`, `Named`, `DriverName` →
`@stackra/container` · `Config`, `Env`, `Secret` → `@stackra/config` · `Resource`, `Widget`,
`Document`, `Panel` → `@stackra/panel` · `Notification`, `Recipient`, `Notifier` →
`@stackra/notifications` · `Prompt`, `Skill`, `Facts` → `@stackra/ai` · `Route`, `Layout`, `Menu`,
`MenuKind`, `ChromeConfig` → `@stackra/navigation` · `Shortcut` → `@stackra/shortcuts` · `Store` →
`@stackra/state` · `AnalyticsEvent` → `@stackra/analytics` · `Bridge` → `@stackra/platform/electron`
· `Block` → `@stackra/experience` · `PublicId`, `Url`, `Email`, `Duration`, `Json`, `Tone`, `Realm`,
`ActorKind`, `ApiArea`, `HttpMethod`, `SortDirection`, `Target` → `@stackra/contracts` · `Money`,
`CurrencyCode` → `@stackra/money` · `StorageArea` → `@stackra/storage` · `ColorScheme` →
`@stackra/theming` · `NumberingSystem`, `Locale` → `@stackra/i18n` · `PromptMoment`, `Capability`,
`DesktopMode`, `OverlayStyle`, `OverlayAnchor` → `@stackra/platform` · `Queues`, `Slots`, `Panels`,
`Flags`, `Routes`, `I18n` → `#stackra/*`, `Refusals` → `#stackra/manifest` · brand CSS →
`@acme/brand/css/tokens.css` (web) and `/css/native.css` (mobile), referenced only as
`--brand-<group>-<name>`. `zod` is imported only by generated code and the `@Field(zod)` hatch.

## Rules

- **Strings appear only where an identity is written.** Every other reference is a generated
  constant or an enum value (`Commerce.actions.CancelOrder`, `I18n.orders.enums.order_status.paid`,
  `Panels.TenantAdmin`, `Permission.L2`, `ActorKind.User`). The other literals allowed are a
  `keyof`-typed literal (`c.text("memberId")`), a `DriverName<Port>` literal (`ledger: "postgres"`),
  a field name in a class facet (`subjects: "customerId"`) and a tool-owned value typed by the
  tool's own union. Every closed set of house values is an `Enum.of` in the package that owns the
  option, or under the app's `src/enums/` when only that app uses it; codes are snake_case.
- Keys are written short (`order.cancel`); gen adds the module and the major
  (`orders.order.cancel@1`). A breaking change to an action is `version: 2`; to an event,
  `version: 2` plus a change file beside it.
- Links point down the graph: a route names its layout by class
  (`extends Route({ path: "/", layout: ShellLayout })`), and its page component is bound by name
  (`<name>.tsx` in its folder). Layouts, menus, pages and data use the generated key
  (`Routes.dashboard` from `#stackra/routes`), never the route class. A layout has no tab list: a
  route declares `tab: { order, icon }`, and the tab bar may be rearranged in one
  `menus/tab-bar.menu.ts`.
- Classes are the only tokens. A constructor parameter names its dependency by type (`import type`),
  the constructor ends with `super()`, and `@Lifetime(Lifetime.Request)` or `Lifetime.Transient` is
  the only scope marker. A named instance is the type `Named<Port, "x">`. Never write `@Injectable`,
  `@Inject`, a providers array, `forRoot` or a string token.
- A sibling module (same member) is reached only through the classes its `Module({ exports })` lists
  and its public groups: `schemas/`, `enums/`, `events/`, `errors/` and `access/*.permissions.ts`;
  its `models/` only from `models/` and `database/`, for relations. A test may also import a
  sibling's `database/factories/` and `models/` to arrange data. Another service is reached through
  its generated client (call or `.queue()`) or its events, never its code or its package.
- Extension: implement an extension point (`extends Extension(Point)`), place a widget
  (`Widget.place`), override a block or Custom widget renderer in `overrides/<owner>/`, or replace a
  binding with `@Replaces(Port)`. Never edit another module's file to change behaviour.
- One fact, one file. What a member IS and what only build tools read → `stackra.config.ts`. How it
  BEHAVES at run time → `src/config/*.config.ts`. What it NEEDS per environment (dedicated resources
  with a reason, secret names, store sizes, config values) → its `runway.yaml`. WHERE it runs and
  how it is packed (topology groups, `isolate`, sizes) → the root `runway.yaml`. Versions →
  `pnpm-workspace.yaml` catalogs. Risk lives on the permission static, "who may run" in the action's
  `actors`, a driver choice in a config field typed `DriverName<Port>` (runway `config` sets it per
  environment), a column or an index on the model.
- Nobody writes an entry: gen writes `.stackra/entry/<target>.ts` (`createApp` from
  `@stackra/app/<target>`), the tool configs and their root shims. A code hatch lives only in
  `vite.extend.ts`, `expo.extend.ts`, `metro.extend.ts` or `electron.extend.ts`, with a `Reason:`
  header.
- Read `.stackra/gen/*.ts` and the member's `stackra.manifest.json` to see what exists; both are
  complete.
- Config is read one way per place: constructor injection by type in a binding, `useConfig(Class)`
  in a React or React Native component. A host overrides a package's config with a
  `<Host><Base> extends Base` subclass of `override` members, restating a literal-union type.
- Errors: a refusal is a class `extends Refusal({ kind })`, thrown as `X.create({...})`; its code
  and its text key are derived. `throw new Error` is banned in authored code, fakes and tests
  included.
- Tests: every test file sits in `__tests__/` beside its subject, `describe` takes the subject
  class, and ids come from factories (`OrderFactory.new().create()`) or the seeders' published ids
  (app tests). Vitest comes only from `@stackra/testing`; the helpers for each concern are in
  README.md ("Test header and helpers"). Unit tests use memory drivers; `.int.test.ts` uses
  `usePostgres()`; every e2e test runs axe.
- Docblocks
  ([Stackra ADR 0007](https://docs.stackra.figentra.com/adr/0007-source-documentation-standard) as
  amended): every authored file opens with the contract block (Purpose, Boundary, Runtime, Governing
  contract); `Runtime` is exactly one of node, browser, worker, react-native, isomorphic;
  `Governing contract` lists published ADR numbers only. A generated file opens with
  `generated by stackra gen from <sources> — do not edit`. Every member, constructors included, has
  a one-line TSDoc saying what the type cannot; tests carry a docblock on every `describe` and `it`.
  `// why`, never `// what`.
- Naming
  ([Stackra ADR 0231](https://docs.stackra.figentra.com/adr/0231-naming-and-casing-standard)):
  module keys one snake_case segment; verbs `get`, `list`, `search`, `stats`, qualifier last; codes
  and route keys snake_case; files kebab-case with the kind suffix; constants SCREAMING_SNAKE;
  namespace lookups `<module>::<path>`; secrets `<PROVIDER>_<PURPOSE>`; constraint names `idx_`,
  `fk_`, `ck_`.

## Commands

Every repo operation is a `stackra` command behind a root script: `pnpm gen` (after any declaration
change; commit the member's `stackra.manifest.json` and `openapi.json`), `pnpm new <kind> <name>`,
`pnpm verify` (the gate CI runs), `pnpm validate`, `pnpm structure` (the group → kind → test table),
`pnpm db:diff`, `pnpm run doctor` (`run`, because `pnpm doctor` is pnpm's own command). Agent
skills, sub-agents, rules and guard hooks are not in this repository: install them once per machine
with `stackra agents setup` (`@stackra/skills`), and read framework know-how through the Stackra MCP
server in `.mcp.yaml`.
