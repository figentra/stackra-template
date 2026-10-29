<!--
Stackra file contract:
Purpose: the agent entry for a Stackra product repository started from the lean starter: what it
         holds, the programming model v3.1 grammar, the group folders, the kind table, the derived
         identities, the dictionary and the rules every agent reads first.
Boundary: vocabulary and placement only; procedures live in skills, the file-kind → test table and
          the test helpers in README.md, the guides in apps/docs/src/docs/guides.
Runtime: node
Governing contract: Stackra ADR 0294 as amended by 0305 (programming model v3.1, class
                    components), 0306 (overrides), 0307 (panel), 0308 (integrations) and 0309
                    (icons), 0295 (build and entry), 0296 (runway), 0265
                    (extensions), 0159 (migrations), 0146 (config), 0107 and 0218 (integrations),
                    0108 and 0213 (settings), 0164 (panel), 0297 (locale URLs), 0302 (design
                    system), 0300 (presets, spelling), 0022 (tests), 0007 (docblocks, amended),
                    0231 (naming), 0140 (errors), 0208 (system roles), 0349 (product package
                    names), 0436, 0439 and 0441 (no app members, root runway surfaces),
                    stackra-15 (the lean starter)
-->

# Agent guide

The programming model is **v3.1**. It amends
[Stackra ADR 0294](https://docs.stackra.figentra.com/adr/0294-programming-model-v3-grammar-folders-identities-and-naming)
(and, where a section says so, ADR 0265, 0295, 0159, 0146, 0164, 0107 and 0218) through
[Stackra ADR 0305](https://docs.stackra.figentra.com/adr/0305-programming-model-v3-1-names-partners-files-and-class-components)
(names, partners, files and class components),
[0306](https://docs.stackra.figentra.com/adr/0306-overrides-one-tree-under-src-overrides-and-five-placement-layers)
(overrides),
[0307](https://docs.stackra.figentra.com/adr/0307-panel-v3-1-resource-tables-placements-widgets-slots-and-dashboards)
(panel),
[0308](https://docs.stackra.figentra.com/adr/0308-integrations-v3-1-provider-descriptions-connection-stores-and-webhooks)
(integrations) and
[0309](https://docs.stackra.figentra.com/adr/0309-icons-declarations-name-an-icon-and-the-platform-resolves-it)
(icons). This file states those rules for this project, and it wins over any older form you find in
a skill or a framework page. In one line: **the path says the kind, the base class is the kind, the
type gives the shape, and the names give identity; gen derives and locks the rest in
`stackra.manifest.json`.**

Why a base class and not a decorator: the base class is the one place TypeScript checks the kind and
its options together (`extends Action({ key, actors })` is typed against the action's own options),
gen reads it from the syntax tree without running code, and nothing needs `reflect-metadata`.
Decorators stay where they attach a fact to one member: a field rule, a step, a transition or a
class facet (the decorator test: if the folder, the suffix, the base class, a field type, a method
name or a derived name already says it, write no decorator).

## This repository

A lean product starter, not a sample product: the root config, `apps/docs`, one example service
(`services/example`, `@figentra/acme-service-example`) and one example package
(`packages/application/example`, `@figentra/acme-example`). Both examples are exactly what
`stackra new` writes for the product key in `runway.yaml` (`product.key: acme`); never hand-edit
them into shape. `pnpm validate` runs `.github/scripts/example-drift.mjs`, which reruns
`stackra new ... --over` per example and fails on a missing file or an authored difference. To start
real work, create the product's own members with `stackra new` and delete the examples (the check
skips a deleted one), or write the first module under `services/example/src/modules/<key>/` and drop
that example's entry from the script. The tool presets are the core `@stackra/*-config` packages
from `catalog:stackra`; there is no `packages/tooling`.

There is no app member besides `apps/docs` (ADR 0441 decisions 2 and 3). The product ships packages;
its web surfaces (`console`, `landing`, …) and mobile apps are entries under `surfaces:` and
`mobile:` in the root `runway.yaml`, each naming an OS shell or template line and the packages it
loads, and Runway builds them. Their sources sit in the root `assets/` tree (`brand/`,
`mobile/<app>/`, `store/<app>/<locale>/`, `landing/`, `lang/`). Never add `apps/console`, `apps/web`
or `apps/mobile`: a new screen is a route, block or component in a package's `react/` or `native/`
entry, loaded by a surface. The code below is illustrative: the paths it names (`orders`,
`commerce`, an app's `src/`) show where a file goes in a shell or a package, not files in this
repository.

## Grammar

| Rule | Says                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1   | The path says the kind: `<scope>/<group>/<name>.<kind>.ts(x)`, or `<scope>/<group>/<name>/<name>.<kind>.ts(x)` for a folder kind (route, block, component). Each suffix has one home group. `.change.ts` sits beside its subject; `<name>.props.ts` beside its component. Tests sit in `__tests__/` beside their subject.                                                                                                                                                                                                                                                                                                     |
| R2   | **Strictly one exported declaration per file**, named from the file: `cancel-order.action.ts` exports `CancelOrderAction`. An enum's `const` and its same-named `type` count as one. Input and Output are `schemas/<name>-input.schema.ts` and `schemas/<name>-output.schema.ts`, also when one file uses them; a notification's Data is `schemas/<name>-data.schema.ts`; Props are `<name>.props.ts`; a hook's result type is `types/<name>.type.ts`. Noun kinds take no suffix; errors end in `Error`.                                                                                                                      |
| R3   | The base class is the kind and its options are the argument. A kind with no options is written bare (`extends Schema`, `extends Signal`), a kind with options is called (`extends Refusal({ kind })`), a kind whose options are all optional allows both (`extends Migration`, `extends Migration({ after })`). A kind base is named `PascalCase(kind)`, never `define*`: `define` is reserved for the four `stackra.config.ts` functions. A member that replaces a base default is `override`.                                                                                                                               |
| R4   | The TypeScript type gives the shape: rule, column and wire type. The initializer is the default, `?:` optional, `\| null` nullable; a `number` carries `@Int` or `@Num`. Gen compiles shapes to Zod and models to MikroORM metadata, so nobody writes Zod (`@Field(zod)` is the one hatch, with a reason).                                                                                                                                                                                                                                                                                                                    |
| R5   | Names give identity. Written once: an action or query `key`, an event `name`, an analytics event `name`, a route `path`, a custom endpoint path, a `@Secret` name. Everything else is derived and locked; a change needs `@Renamed(old)`.                                                                                                                                                                                                                                                                                                                                                                                     |
| R6   | Decorators are field (`@Str`, `@Int`, `@Num`, `@List`, `@Trim`, `@Lowercase`, `@Hidden`, `@Visible`, `@Classified`, relations, `@Secret("NAME")`, `@Setting`, `@Renamed`, `@Field`), method (`@Step`, `@Transition`) or class facet (`@Index`, `@Searchable`, `@Auditable`, `@AccessLogged`, `@Lifetime`, `@Replaces`). `@Env` is retired (a config's `env` map replaces it); there is no `@Cached` and no kind decorator.                                                                                                                                                                                                    |
| R7   | **Components are classes**: `export class X extends Component<XProps>`, compiled by gen to a React function component ([Class components](#class-components)). A `.mail.tsx` mail body is a component too (`extends Component<MailProps<typeof XNotification>>`). React hooks (`use-<name>.ts`), `functions/<name>.function.ts` and `<name>.server.ts` stay functions. An error boundary is never a class component: `@stackra/navigation` owns it.                                                                                                                                                                           |
| R8   | A type that an exported signature needs is its own `types/<name>.type.ts` (`contracts/types/` when a package exports it). Enums always get their own file. No anonymous object type of two or more members in an exported signature.                                                                                                                                                                                                                                                                                                                                                                                          |
| R9   | One blank line between class members; an object of two or more properties in decorator or base-factory arguments goes one property per line. Every file opens with the four-field header; every member has a one-line TSDoc.                                                                                                                                                                                                                                                                                                                                                                                                  |
| R10  | `.stackra/` is generated and fully gitignored. The committed contracts sit at the member root: `stackra.manifest.json` and `openapi.json`. A tool that reads only the member root reads a gitignored shim there.                                                                                                                                                                                                                                                                                                                                                                                                              |
| R11  | **Partners by type argument**: the class a declaration is typed against is a type argument (`Policy<Order>`, `Resource<Order>({…})`, `Widget<OrderKpisQuery>({…})`, a slot as `Extension<Point["slot"]>`; `Resource<Order, OrderView>` names a differing list row only until gen writes the model-to-row map); a sibling of the same stem is found by name. A value argument only where members are inherited (`Driver(MailTransport)`, `Widget.place(BaseX, {…})`, `extends BaseX`). Inside a decorator a model is a thunk (`@ManyToOne(() => Variant)`); same module `Ref<T>` or `Collection<T>`, another module `Link<T>`. |
| R12  | Every member authors `stackra.config.ts`. `<key>.module.ts` is written only when it says something gen cannot derive ([Modules](#modules)). Nobody writes `main.ts`, an `*.app.ts`, an entry barrel or an `index.ts` beside a root module. Exempt from `stackra.config.ts`: the core `@stackra/*-config` presets.                                                                                                                                                                                                                                                                                                             |

## Group folders

A module is `src/modules/<key>/` in a service and `src/node/` in a package. A group folder appears
with its first file.

| Group                                | Holds                                                                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| (module root)                        | `<key>.module.ts` (only when it says something), `<key>.settings.ts` (one per module), `README.md`                       |
| `models/`                            | `.model.ts`, `.state-machine.ts`, `.bucket.ts`, `.projection.ts`                                                         |
| `actions/`, `queries/`               | `.action.ts`, `.query.ts`                                                                                                |
| `schemas/`                           | `.schema.ts`: every Input, Output, Data, view, nested and `<stem>-options` shape; `.change.ts` (a dated response change) |
| `enums/`, `errors/`                  | `.enum.ts`, `.error.ts`                                                                                                  |
| `events/`                            | `.event.ts`, `.change.ts` (an event version beside its event)                                                            |
| `listeners/`                         | `.listener.ts`                                                                                                           |
| `workflows/`                         | `.workflow.ts`, `.signal.ts`                                                                                             |
| `access/`                            | `.permissions.ts`, `.policy.ts`, `.role.ts`, `.entitlement.ts`, `.precondition.ts`, `.flag.ts`                           |
| `services/`                          | `.service.ts`, `.repository.ts` (only for named reads beyond `CrudService`)                                              |
| `drivers/`                           | `.driver.ts`                                                                                                             |
| `integrations/`, `connections/`      | `.integration.ts`, `.connection.ts`                                                                                      |
| `extensions/`                        | `.extension-point.ts`, `.extension.ts`, `.interceptor.ts`                                                                |
| `raw/`                               | `.controller.ts` (a service only: `/api/auth/*` or a stream)                                                             |
| `resources/<model>/`                 | `.resource.ts`, `.widget.ts`, `.document.ts`, `.notification.ts`, `.mail.tsx`                                            |
| `database/migrations/`               | `NNNN-<name>.migration.ts`, numbered per module from `0001`                                                              |
| `database/macros/`                   | `<name>.macro.ts` (a `Blueprint` macro; a package's reach its hosts, a service module's stay in its service)             |
| `database/factories/`                | `<model>.factory.ts`                                                                                                     |
| `database/seeders/`                  | `minimal.seeder.ts`, `demo.seeder.ts`, `test.seeder.ts`                                                                  |
| `ai/`                                | `.prompt.ts`, `.skill.ts`, `.facts.ts`                                                                                   |
| `functions/`, `constants/`, `types/` | `.function.ts`, `.constant.ts`, `.type.ts`                                                                               |

An app's `src/` holds an optional `<key>.module.ts`; `config/` (`.config.ts`, including
`desktop.config.ts` and `chrome.config.ts`); `panels/`, `menus/`, `shortcuts/`, `documents/`,
`stores/`, `flags/`, `analytics/` (`.analytics-event.ts`) and `bridges/`; `routes/<name>/`
(`<name>.route.ts` or `<name>.layout.ts`, the page class `<name>.tsx`, optional `<name>.error.tsx`
to customise the boundary, `<name>.fallback.tsx`, `<name>.server.ts`, `use-<name>.ts`);
`blocks/<name>/` (`<name>.block.ts`, `<name>.tsx`, `<name>.props.ts`, optional `<name>.native.tsx`);
`components/<name>/` (`<name>.tsx`, `<name>.props.ts`, `index.ts` re-exporting the component and its
Props only); `hooks/` (a `use-<name>.ts` with two or more importers); `overrides/<owner>/…`
([Overrides](#overrides)); `providers/<name>/` (only for the `Module({ wrap })` hatch); `enums/`,
`types/` (hook result types included), `styles/`; and `schemas/` (`.schema.ts`, the config
`<stem>-options` shapes included) and `errors/` (`.error.ts`) for the app's own shapes and refusals.
There is no `app.error.tsx` and no `components/error-boundary/`.

A service's `src/` holds `config/` (`.config.ts`), `schemas/` (the config `<stem>-options` shapes),
`contracts/` (its public type surface) and `modules/<key>/`. A package's `src/` holds `contracts/`
(the leaf: `ports/`, `enums/`, `types/`, hook result types included), `config/` (`.config.ts`),
`core/` (isomorphic services, drivers, errors, functions, schemas with the config `<stem>-options`
shapes, blocks), `node/` (the module, with the groups above), `react/<name>/`, `native/<name>/`
(`<name>.tsx`, `<name>.props.ts`, `use-<name>.ts`), `testing/` (`<name>.fake.ts`,
`<name>.matcher.ts`, `<name>.fixture.ts`) and `<entry>/<pkg>.explorer.ts` only when it ships
decorators. Dependencies run contracts ← core ← node, react, native ← testing; the entry barrels are
generated.

There is no `links/`, `guards/`, `hooks/` (in a service), `states/`, `repositories/`,
`override-points/`, `mails/`, `versions/`, `seeds/`, `permissions/`, `policies/`, `settings/`,
`commands/`, `features/`, `utils/`, `helpers/`, `dtos/`, `screens/` or `assets/overrides/` folder.

## Kind table

Every kind is declared by its base class. "Binding" says whether the container registers the class
(gen prints it in `wiring.ts`).

| Kind                       | Declared as                                                                                                                                                                                                  | Binding    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| Module                     | `Module({ exports, imports, wrap })`, only when it states one of them; `imports` narrow or add client modules, `wrap` on app roots                                                                           | no         |
| Settings                   | `extends Settings({ scopes, navigation })`, one per module; a schema-typed field is a section; `@Setting({ scopes, lockable, approval, client })` per field                                                  | no         |
| Model                      | `extends Model.with(...traits)`; `BelongsToTenant` is imported from `@stackra/tenancy/node`, the other traits from `@stackra/model`                                                                          | no         |
| State machine              | `extends StateMachine<Order>({ field })`, one `@Transition` method per transition                                                                                                                            | yes        |
| Schema                     | `extends Schema`, another schema class, `CursorInput` or `Page.of(X)`, or `PickType`, `OmitType`, `PartialType` of one; built with `X.create({...})`, never `new`                                            | no         |
| Enum                       | `export const X = Enum.of({...})` plus `export type X = Enum.Value<typeof X>`                                                                                                                                | no         |
| Error                      | `extends Refusal({ kind: ErrorKind.X })`, details as fields; thrown as `X.create({...})`                                                                                                                     | no         |
| Action, query              | `extends Action({ key, actors, endpoint, tool, job, intent, ... })`, `extends Query({ key, cache, ... })`; input and output are the types of `handle`, each in `schemas/`                                    | yes        |
| Event                      | from `@stackra/events`: `extends DomainEvent`, `IntegrationEvent({ name, version, webhook, broadcast })`, `WebhookEvent<XIntegration>({ type })`, `AnalyticsEvent({ name })`                                 | no         |
| Change                     | `extends Change<OrderPaid>({ from, sunset })` (event version) or `Change<OrderView>({ date, sunset })` (response)                                                                                            | no         |
| Listener, projection       | `extends Listener` or `Listener({ queue, retry })`, `handle(event: E, ctx)` subscribes to `E`; `extends Projection<Source>({...})`                                                                           | yes, no    |
| Workflow, signal           | `extends Workflow({ startOn, correlate, timeout })` or `Workflow<Input>({ timeout })`; `extends Signal`                                                                                                      | yes, no    |
| Permissions, policy, role  | `extends Permissions` (`static readonly cancel = Permission.L2`), `extends Policy<Order>` (reads `OrderPermissions` by name), `Role({ grants })`                                                             | no, yes    |
| Precondition               | `extends Precondition`, with `check(ctx)`                                                                                                                                                                    | yes        |
| Entitlement, flag          | `extends Entitlement({ kind, counts })`, `extends Flag({ default, scopes, expires })`                                                                                                                        | no         |
| Service                    | `extends CrudService<Order>` or `extends Service`                                                                                                                                                            | yes        |
| Port, driver               | `abstract class X extends Port` (packages, `contracts/ports/`), `extends Driver(Port)` named by its file prefix                                                                                              | token, yes |
| Integration, connection    | `extends Integration({ provider, category, levels, auth, baseUrl, ... })` with platform `@Secret` fields; `extends Connection<XIntegration>` with tenant `@Secret` fields and `check()`                      | yes        |
| Extension point, extension | `extends ExtensionPoint` (`ExtensionPoint.before<Args>()`, `.after<Value, Args>()`); `extends Extension<XExtensionPoint["slot"]>({ order, input })` or bare, one `handle(...)` method                        | no, yes    |
| Interceptor, controller    | `extends Interceptor` (`intercept(ctx, next)`: the `around` of an action call), `extends Controller({ path })` (raw HTTP only)                                                                               | yes        |
| Resource                   | `extends Resource<Order>({ area, navigation, operations })`, or `Resource<Order, OrderView>` when the list row differs, with `override` members `table`, `views`, `form`, `infolist`, `relations`, `actions` | yes        |
| Widget, document           | `extends Widget<XQuery>({ slot, size, order, ranges, range, roles })` with `display(d)`, or `Widget.place(BaseX, {...})`; `extends Document({ kind, path, blocks })`                                         | no         |
| Notification               | `extends Notification({ category })`, `recipients(event)` and one method per channel; the body is the class component `<stem>.mail.tsx`, its data `schemas/<stem>-data.schema.ts`                            | yes        |
| Migration, macro           | `extends Migration` or `Migration({ after, timeouts })`, `up(schema)` only; `extends Macro`, `apply(t, ...args)`                                                                                             | no         |
| Factory, seeder            | `extends Factory<Order>`, `extends Seeder`                                                                                                                                                                   | no         |
| Prompt, skill, facts       | `extends Prompt` or `Prompt({...})`, `extends Skill({ tools })`, `extends Facts<Order>`                                                                                                                      | yes        |
| Route, layout              | `extends Route({ path, layout, tab, flag })` or `Layout({...})`, with `override loader`, `submit`, `meta`                                                                                                    | yes        |
| Component                  | `export class X extends Component<XProps>` (`Component` from `#stackra/ui`); a page is `Component<RouteProps<typeof XRoute>>`                                                                                | no         |
| Panel, menu, shortcut      | `extends Panel({ path, area })`, `Menu({ kind: MenuKind.App })` with `items(m)` (web and native; Electron roles stay in `desktop.config.ts`), `Shortcut({ keys })`                                           | yes        |
| Store, block, bridge       | `extends Store({ persist })`, `Block({ category, icon })`, `Bridge({ capability })`                                                                                                                          | yes        |
| Config                     | `extends Config({ schema: XOptions, env: { field: "ENV_NAME" } })`; a host override `X extends BaseX` sets `override` field defaults only                                                                    | token      |

## Partners

A declaration that works on another class names it once, in the place TypeScript checks.

- The subject is the type argument: `Policy<Order>`, `Resource<Order>({…})`
  (`Resource<Order, OrderView>` when the list row differs from the model), `Factory<Order>`,
  `CrudService<Order>`, `StateMachine<Order>({ field })`, `Facts<Order>`, `Widget<OrderKpisQuery>`,
  `Connection<ResendIntegration>`, `Extension<OrderExtensionPoint["adjustTotals"]>`,
  `Change<OrderView>({…})`, `Projection<Source>({…})`, `WebhookEvent<ResendIntegration>({ type })`.
- A sibling of the same stem is bound by name: `OrderPolicy` reads `OrderPermissions`,
  `ResendConnection` reads `ResendIntegration`, and the type argument must agree
  (`partner_mismatch`). When the stem differs, the sibling is an option:
  `Policy<Order>({ permissions: SalesPermissions })`.
- A value argument only where the new class inherits members from it: `Driver(MailTransport)`
  (TypeScript enforces the port's abstract members), `Widget.place(BaseX, {…})` and every override
  (`extends BaseX`).
- Class references inside options stay (`operations`, `preconditions`, `startOn`, `invalidateOn`):
  they list collaborators, not the subject. `Model.with(...traits)` is unchanged: traits are mixins.

## Derived identities

Gen derives these and locks them in `stackra.manifest.json`; `stackra gen --check` fails on a change
without `@Renamed(old)`.

| Identity               | Formula                                                                                                    | Example                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Member key             | the member's folder name, snake_case                                                                       | `commerce`, `loyalty_kit`                 |
| Module key             | folder name, snake_case; a member with no module file is one module keyed by its folder                    | `orders`                                  |
| Model key, table       | `<module>.<snake(Class)>`; the plural table in the module's Postgres schema                                | `orders.order_line`, `orders.orders`      |
| Permission             | `<module>.<snake(class minus "Permissions")>.<static>`                                                     | `orders.order.cancel`                     |
| Role, flag             | `<module>.<snake(class minus suffix)>`                                                                     | `orders.quick_order`                      |
| Config key             | the member key for the file named after it, else `<member>.<snake(stem)>`; an override inherits its base's | `commerce`, `commerce.rate_limit`         |
| Error code             | `snake(class minus "Error")`                                                                               | `order_not_payable`                       |
| Action or query key    | `<module>.` + `key` + `@<major>`                                                                           | `orders.order.cancel@1`                   |
| MCP tool, job          | `snake(key with dots as _)`; a job is named by its key                                                     | `orders_order_create`                     |
| Intent phrases         | `<module>::actions.<key>.intents`, one list per locale                                                     | `orders::actions.order.create.intents`    |
| Integration event      | `<module>.` + `name` + `.v<n>`; a domain event carries no version                                          | `orders.order.paid.v1`                    |
| Migration id           | `<module>.<NNNN>_<snake(stem)>`, typed in `#stackra/migrations`                                            | `orders.0002_add_order_paid_at`           |
| Macro                  | `t.<camel(class minus "Macro")>()`                                                                         | `MoneyMacro` → `t.money()`                |
| Webhook path           | `/webhooks/<module>/<snake(integration minus "Integration")>/:connectionId`                                | `/webhooks/messages/resend/:connectionId` |
| Notification, template | `<module>.<snake(class minus "Notification")>`; `<module>::<notification>.<channel>`                       | `orders::order_receipt.mail.subject`      |
| Seeder                 | `<module>.<profile>`                                                                                       | `orders.demo`                             |
| i18n default keys      | `<module>::<kind>.<name>.<part>`                                                                           | `orders::actions.order.cancel.confirm`    |

Endpoints follow the key: `x.list` → `GET /xs`, `x.get` → `GET /xs/:xId`, `x.create` → `POST /xs`,
`x.update` → `PATCH /xs/:xId`, `x.delete` → `DELETE /xs/:xId`, any other verb →
`PUT /xs/:xId/<verb>` (input has `xId`) or `POST /xs/<verb>`, any other query → `GET /xs/<name>`.
`endpoint: { method, path }` keeps a path the convention would not give; `endpoint: false` removes
it.

## Words that mean one thing

| Word                      | Means only                                                                                                              | Retired or not this                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Member, module, entry     | a workspace member; a folder of kind files (with `<key>.module.ts` only when it says something); a package subpath      | `@App`, `@Service`; an empty `extends Module {}`                                         |
| Action, query             | a write; a read (L0 to L1, GET, cacheable, an MCP tool)                                                                 | a route's `submit()` is not an action                                                    |
| Surface                   | one way an action is reached: `endpoint`, `tool`, `job`, `intent`                                                       | the `ux` option (retired)                                                                |
| Intent                    | a phrase list in the lang files that lets the palette or an agent pick an action                                        | inline English `intents: [...]`                                                          |
| Command                   | a CLI command only                                                                                                      | palette and key entries are Shortcuts (`@stackra/shortcuts`)                             |
| Job                       | an action run from a queue or a cron (`job:` option)                                                                    | not a kind                                                                               |
| Precondition              | whether a call may run now, whoever asks                                                                                | Guard, Gate                                                                              |
| Policy, permission, role  | record rules per verb; a grantable right with its risk; a bundle                                                        | never a precondition                                                                     |
| Realm, area, scope        | an actor population; `ApiArea`; a settings or IAM scope                                                                 | `Realm.TenantAdmin`; a DI lifetime is a `Lifetime`; OAuth scopes live only inside `auth` |
| Extension point           | the seam a module owns and publishes, part of its contract like an event: named `before` and `after` slots              | backend "hook" and "hook point"; `transform`, `verify`                                   |
| Extension                 | one class in another module that plugs into one slot of one extension point                                             | "plugin" (tool plugins only)                                                             |
| Interceptor               | the `around` of one action call (`intercept(ctx, next)`)                                                                | a method-level `around` (never)                                                          |
| Override, replacement     | a file in `src/overrides/<owner>/…` that shadows the owner's file at the same path; `@Replaces(Port)`                   | `.override.tsx`, `assets/overrides/`, the override-point kind                            |
| Component                 | a class `extends Component<P>` that gen compiles to a function component                                                | `Component` from `react`; a class error boundary                                         |
| Hook, provider            | React only: a `use*` function; a component that renders a context's value                                               | DI providers are bindings; `@ContextProvider` is `Facts`                                 |
| Port, driver, adapter     | an abstract contract class; its implementation; generated glue only                                                     | —                                                                                        |
| Token                     | the class itself                                                                                                        | `defineToken`, string tokens, `@Inject`                                                  |
| Model, schema, view, link | a persisted entity; a wire shape; an output `<X>View`; `Link<T>`                                                        | `@Link`, `links/`, DTO                                                                   |
| State machine, transition | a model field's lifecycle class; one of its methods                                                                     | `states/`                                                                                |
| Config, settings, flag    | deploy-time configuration; tenant runtime settings; an on/off switch with scopes and an expiry                          | a secret in settings (a credential is a `ConnectionRef<C>`)                              |
| Widget, slot, place       | a query rendered by a display; a named spot on a page; the shape of a slot (Band, Grid, Aside, Tabs, Banner, Checklist) | a dashboard's inline table                                                               |
| Metric                    | a typed KPI value with previous period, series and target (`MoneyMetric`, `CountMetric`, …)                             | three loose field names                                                                  |
| Notification, toast       | a message to people; a transient in-app message                                                                         | `@stackra/mail` is `@stackra/notifications`                                              |
| Change                    | a versioned conversion of an event or a response (`up`, `down`)                                                         | `@Upcast`                                                                                |
| Migration, macro          | a frozen snapshot of DDL; a named `Blueprint` helper owned by a package or module                                       | an authored `down()`                                                                     |
| Factory, seeder           | Laravel meanings; profiles are minimal, demo and test                                                                   | "fetchers"; a `.factory.ts` outside `database/factories/`                                |
| Fake, matcher, fixture    | a package's test helpers: `testing/<name>.fake.ts`, `.matcher.ts`, `.fixture.ts`                                        | —                                                                                        |
| Integration, connection   | a provider and how to reach it (one per listing); one stored credential set for it (tenant or user)                     | —                                                                                        |
| `stackra.manifest.json`   | the member contract, committed at the member root                                                                       | `app-manifest.json`                                                                      |

## Action or query

|           | Action (`actions/`, `extends Action`)                                                         | Query (`queries/`, `extends Query`)        |
| --------- | --------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Does      | changes state: create, update, transition, delete                                             | reads; changes nothing                     |
| HTTP      | `POST`, `PUT`, `PATCH` or `DELETE` by the endpoint convention                                 | `GET` by the endpoint convention           |
| MCP       | only with `tool: true` (a write opts in; risk and approval from its level)                    | an MCP tool automatically                  |
| Retries   | `Idempotency-Key` unless the verb is idempotent (`idempotency:`)                              | safe to repeat                             |
| Offline   | may queue (`offline: { mode: OfflineMode.Queue }`) and replay                                 | the client shows its last persisted result |
| Caching   | never cached                                                                                  | `cache: { ttl, invalidateOn, per }`        |
| Long work | `handle` returns `ctx.run(Workflow, input)` for several steps                                 | never; it answers from what is stored      |
| Client UX | confirmation follows the permission level (L2 asks); placement is the resource's `actions(a)` | none                                       |

Each surface is one typed option with a default derived from the key and the actors, locked in the
manifest:

| Option     | Default                                                      | Derived                                        | Gen checks                                       |
| ---------- | ------------------------------------------------------------ | ---------------------------------------------- | ------------------------------------------------ |
| `endpoint` | on when the actors include User or Agent; `false` removes it | the route by the endpoint convention           | `endpoint_method_mismatch`                       |
| `tool`     | on for queries, off for actions                              | the MCP name; risk and approval from the level | `tool_without_agent_actor`                       |
| `job`      | off; `job: { queue, unique, timeout, retries, cron }`        | the job name is the key; `Queues.*` typed      | `job_without_system_actor`, `cron_input_invalid` |
| `intent`   | off; `intent: true`                                          | phrases at `<module>::actions.<key>.intents`   | `intent_phrases_missing` (every locale)          |

## Class components

A component is a class; gen compiles it to a plain React function component before the React
Compiler runs, so Fast Refresh, DevTools names and stack traces point at the class. The compiler is
wired by the generated tool configs, never by hand: `classComponents()` from `@stackra/gen/node` in
`.stackra/vite.config.ts`, and `@stackra/gen/metro-transformer` in `.stackra/metro.config.js` (the
member lists `@stackra/gen` as a `catalog:stackra` devDependency). Import `Component` from
`#stackra/ui` (gen re-exports the facade for each target; ADR 0305 rule 37), never from `react`;
every other component comes from `@stackra/ui/react` (web and package `react/` entries) or
`@stackra/ui/native` (mobile and package `native/` entries), never the package root. A component
without props is `extends Component`; with props, `extends Component<XProps>` and `XProps` in
`<name>.props.ts`.

```tsx
// illustrative: apps/<name>/src/components/pending-changes/pending-changes.tsx
export class PendingChanges extends Component {
  /** A field whose initializer calls a hook is a read-only hook field. */
  i18n = useTranslation();

  /** The offline mutation queue. */
  queue = useMutationQueue();

  /** A getter is a derived value: queued entries plus conflicts. */
  get total() {
    return this.queue.items.length + this.queue.conflicts.length;
  }

  /** The body: hooks, locals and early returns are allowed here. */
  render() {
    const { t } = this.i18n;
    return (
      <Button isIconOnly aria-label={t(I18n.console.queue.open, { count: this.total })}>
        <Icon name="cloud-upload" aria-hidden />
      </Button>
    );
  }
}
```

| Supported                                                                                  | Not supported (gen error)                                                              |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| a field with an initializer is state; `x?: T` is an empty state field                      | a field with neither an initializer nor `?`                                            |
| `x = useY(...)` is a read-only hook field: contexts, stores, translations, refs (`useRef`) | writing a hook field; `ref` forwarding (a ref is a hook field)                         |
| methods are plain functions; getters are derived values                                    | setters, generator methods, `static` members, `#private` members                       |
| `mount()` and a synchronous `unmount()`, the only lifecycle                                | calling `mount()` yourself, an async `unmount()`, a `constructor`                      |
| `render()` is the body: hooks, `use(Ctx)` and early returns allowed                        | `this.setState`, `this.state`, `this.context`, `forceUpdate`, a bare `this`            |
| immutable writes: `this.items = [...this.items, x]`, `this.count++`, `this.x ??= v`        | mutating state (`this.items.push(x)`), a state write used as a value                   |
| `this.props`, typed from `Component<P>`                                                    | class decorators, abstract or non-top-level component classes, an error boundary class |

Three behaviours to know. **Snapshot reads**: after `this.count++`, `this.count` still holds the
render's value in the same handler; write the new value explicitly when you need it
(`this.props.onChange?.(this.count + 1)`). **Initial-only fields**: `label = this.props.label` does
not follow later prop changes; a derived value is a getter. **Methods are memoized, not permanently
stable**, and in development `mount()` and `unmount()` run twice under StrictMode, as an effect
does. Own state needs nothing new: a field is state, a hook field reads a context, and a provider is
a component that renders `<Ctx value={…}>`. Custom hooks stay plain functions in `use-<name>.ts`;
their result interface is `types/<name>.type.ts`. **Lint**: the hooks rules refuse hook fields by
design, so the oxlint preset turns `rules-of-hooks` and `exhaustive-deps` off on component `.tsx`
source; `stackra lint` runs both on gen's compiled output and reports each finding at the class
line. Custom hooks and component tests keep the rules on. Until `stackra lint` ships with gen, no
check enforces the hooks rules on component source: review reads hook fields and hooks in `render()`
against the supported surface above.

## Modules

A module is a folder. Write `<key>.module.ts` only when it states something gen cannot derive:
`exports` (the classes siblings may use), root `imports` that narrow or add client modules, or an
app's `wrap`. An empty `extends Module {}` fails lint (`empty_module`); a member with no module file
is one module keyed by its folder name, importing every workspace and `@stackra/*` dependency that
ships one. A package with no module file still gets a generated `<Key>Module` in its `node` entry,
so hosts import `LoyaltyKitModule`. Consumed modules and every other generated client class are
imported by name from a per-service subpath, never walked through a namespace:

```ts
// illustrative: apps/mobile/src/mobile.module.ts, kept because it narrows what the binary ships
import { Module } from "@stackra/container";
import { CatalogueModule, OrdersModule } from "#stackra/clients/commerce";
import { ExperienceModule } from "#stackra/clients/experience";
import { DevicesModule, IdentityModule } from "#stackra/clients/identity";
import { MessagesModule } from "#stackra/clients/notifications";

/** The six modules the binary ships. */
export class MobileModule extends Module({
  imports: [
    IdentityModule,
    DevicesModule,
    CatalogueModule,
    OrdersModule,
    MessagesModule,
    ExperienceModule,
  ],
}) {}
```

The same subpath exports the service's actions, queries, events, enums and permissions
(`import { CreateOrderAction, GetOrderQuery, OrderPaid, OrderStatus } from "#stackra/clients/commerce"`);
the subpath keeps two services' `messages` modules apart.

## Events

Every event base comes from `@stackra/events`; the base is the type, so there is no `type:` option.
`Event` is the shared abstract envelope (id, occurredAt, actor, tenant) and `extends Event` fails
gen (`event_base_abstract`).

| Base               | Delivery                                                                  | Versioned       |
| ------------------ | ------------------------------------------------------------------------- | --------------- |
| `DomainEvent`      | in-process, inside the transaction, inside one module                     | never           |
| `IntegrationEvent` | outbox, cross-service, MCP-visible, optional broadcast and webhook        | `.v<n>`         |
| `WebhookEvent<I>`  | inbound, verified and routed by its Integration                           | provider's type |
| `AnalyticsEvent`   | client product analytics through the consent queue (`@stackra/analytics`) | no              |

A domain event reaches another service only through a listener that records an integration event.

## Extensions

An **extension point** is the seam a module owns: `extensions/<name>.extension-point.ts`, part of
its public contract (a sibling may import it). An **extension** is one class in another module that
plugs into one slot of that point: `extensions/<name>.extension.ts`. The slot is an indexed type
argument and the class has one `handle(...)` method, the house verb as on an action or a listener,
so "one extension implements one slot" is structural:
`extends Extension<OrderExtensionPoint["adjustTotals"]>({ order: 200 })`, or bare
(`extends Extension<OrderExtensionPoint["verifyPlacement"]>`) when it takes no options. There is
never an `Extension<OrderExtensionPoint>` with a method named after a slot. The words are Magento's:

| Magento  | Stackra                                           | Runs                                                   | May                                                                  |
| -------- | ------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------- |
| `before` | `ExtensionPoint.before<Args>()`                   | before the owner's step, ascending `order`             | refuse (throw a Refusal) or return replacement args of the same type |
| `after`  | `ExtensionPoint.after<Value, Args>()`             | after the owner computed a value, ascending `order`    | return the adjusted value; each sees the previous result             |
| `around` | `extends Interceptor`, `intercept(ctx, next)`     | around one action call, between idempotency and handle | short-circuit or wrap; there is no method-level `around` (ADR 0265)  |
| —        | the implicit `before` and `after` of every action | input after validation; output before return           | as above                                                             |

```ts
// orders/extensions/order.extension-point.ts
export class OrderExtensionPoint extends ExtensionPoint {
  /** After pricing a draft; each extension returns the totals it adjusted. */
  readonly adjustTotals = ExtensionPoint.after<OrderTotals, [draft: OrderDraft]>();

  /** Before stock or payment is touched; an extension refuses by throwing a Refusal. */
  readonly verifyPlacement = ExtensionPoint.before<[draft: OrderDraft]>();
}

// loyalty/extensions/redeem-points.extension.ts
export class RedeemPointsExtension extends Extension<OrderExtensionPoint["adjustTotals"]>({
  order: 200,
  input: RedeemPointsRequest,
}) {
  /** The slot's value first, then its arguments, then the context. */
  async handle(totals: OrderTotals, draft: OrderDraft, ctx: ExtensionContext): Promise<OrderTotals> { … }
}

// loyalty/extensions/verify-points-balance.extension.ts: no options, so bare
export class VerifyPointsBalanceExtension extends Extension<OrderExtensionPoint["verifyPlacement"]> {
  /** Refuses the placement by throwing a Refusal, or returns the arguments (replaced or not). */
  async handle(draft: OrderDraft, ctx: ExtensionContext): Promise<[draft: OrderDraft]> { … }
}
```

The owner calls each slot explicitly, so every call site is greppable, and gen prints every chain in
the manifest. An extension's `input` adds a typed field under `extensions.<module>` to the action's
input.

## Resources, widgets and settings

A **resource** is `Resource<Order>({ area, navigation, operations })`. Its keys are wire paths of
the list, get and input shapes, checked against a model-to-row map gen writes; where the list row
differs from the model, the row is the second type argument, `Resource<Order, OrderView>({…})`, and
the member matches it (`table(t: Table<OrderView>)`). The second argument is the interim form: once
gen writes the model-to-row map, `Resource<Order>({…})` alone checks the row's keys and the second
argument is dropped. The table is a server contract: gen compiles sort, filters and search into the
list query's closed `TableInput`, applied by `CrudService.table`, and fails on a sortable or
filterable key without an index. One `actions(a)` member lists every button; the action's input
decides where it renders (record id only → Row, View, Edit; record id plus fields → the same, with a
modal form; `Selection<P>` → the bulk bar; neither → the list header), `.in(ActionPlace.View)`
narrows and `.bulk()` fans out with the policy per record. Members are `override` methods: `table`,
`views`, `form`, `infolist`, `relations`, `actions`. Labels are derived keys
`<module>::resources.<model>.*`. `bulkActions`, `toasts` and the action `ux` option are retired.

A **widget** is `Widget<XQuery>({ slot, … })` with a typed `display(d)`. A KPI binds to a metric
field of the query's output (`MoneyMetric`, `CountMetric`, `NumberMetric`, `PercentMetric`,
`DurationMetric` from `@stackra/panel`), which carries value, previous period, series and target;
the query computes them through `CrudService.metrics()` and the panel presents. `refreshOn` is
derived from the query's `cache.invalidateOn`; write it only for an uncached query. The home
dashboard has two slots, `Slots.Dashboard.Header` (a Band of KPIs) and `Slots.Dashboard.Main` (a
12-column Grid). A Dashboard document places widget classes only. Banners and checklist items are
widgets with the Banner and Check displays in `Slots.Shell.Banner` and `Slots.Shell.Checklist`.

```ts
// orders/resources/order/order-kpis.widget.ts (abridged)
export class OrderKpisWidget extends Widget<OrderKpisQuery>({
  slot: Slots.Dashboard.Header,
  ranges: [TimeRange.Today, TimeRange.Last7Days, TimeRange.ThisMonth],
  range: TimeRange.Today,
}) {
  /** Format, trend, sparkline and target come from the metric types. */
  display(d: Display<OrderKpisOutput>) {
    return d.kpiGroup([d.kpi("revenue").icon("banknote"), d.kpi("orders").icon("receipt")]);
  }
}
```

**Settings** are one `<module>.settings.ts`, `extends Settings({ scopes })`. A field typed by a
schema class is a section (depth one); scopes are Platform, Product, Tenant, Node and User, narrowed
per field with `@Setting({ scopes, lockable, approval, client })`; cross-field rules come from a
closed `rules(r)` set. A setting is never a secret (a credential is a `ConnectionRef<C>`), and code
reads it with `SettingsReader#get(OrdersSettings)`.

## Overrides

Everything that changes code or assets the member does not own lives in one tree,
`src/overrides/<owner>/…`, mirroring the owner's own paths. `<owner>` is the package name with its
scope (`@figentra/acme-loyalty-kit`) or `<service>/<module>` for a consumed service module. A file
there shadows the owner's file at the same path: no keyword, no `.override.tsx` suffix.

```text
apps/mobile/src/overrides/commerce/orders/assets/lang/ar/orders.json                              keys merged over the owner's
apps/console/src/overrides/@figentra/acme-loyalty-kit/src/react/points-balance/points-balance.tsx  renderer shadow
apps/console/src/overrides/@figentra/acme-loyalty-kit/src/node/resources/loyalty-account/points-balance.widget.ts
```

A shadow keeps its base's name and imports the base under a `Base` alias; there are no
`<Host><Base>` names:

```ts
import { PointsBalanceWidget as BasePointsBalanceWidget } from "@figentra/acme-loyalty-kit/node";

/** On the console dashboard's grid instead of the account page. */
export class PointsBalanceWidget extends Widget.place(BasePointsBalanceWidget, {
  slot: Slots.Dashboard.Main,
  order: 40,
}) {}
```

Five layers, each replacing the one below for that item: 1 the owner's default; 2 a host module
(`Widget.place`, a `@Replaces(Port)` driver); 3 the app's `src/overrides/`; 4 the tenant's copy
(data); 5 the user's overlay (data). Layers 1 to 3 are code that gen checks; 4 and 5 are validated
on save and on read. Lang files merge by key; images and icons replace; a `.tsx` shadow exports the
same name with the same Props type; a declaration shadow extends its `Base` and changes only what
its kind allows. Gen fails on `override_target_missing`, `override_shape_mismatch` and
`override_duplicate`, and on a package upgrade lists every shadow whose target changed
(`override_target_changed`). Configuring a package is not overriding it: config overrides stay in
`src/config/`, and behaviour swaps stay `@Replaces(Port)` drivers.

## Config

Behaviour read at run time is a config class in `src/config/` whose options are a shape class, the
counterpart of NestJS `registerAs` with a validation schema:

```ts
// src/schemas/commerce-options.schema.ts
export class CommerceOptions extends Schema {
  /** ISO 4217 code used when a market does not name one. */
  defaultCurrency: CurrencyCode = "USD";

  /** Base URL the confirmation mail links to; read from the environment. */
  storefrontBaseUrl!: Url;

  /** API key the pricing client presents; a reference, resolved blind. */
  @Secret("PRICING_API_KEY")
  pricingApiKey!: string;
}

// src/config/commerce.config.ts
export class CommerceConfig extends Config({
  schema: CommerceOptions,
  env: { storefrontBaseUrl: "STACKRA_STOREFRONT_BASE_URL" },
}) {}
```

`schema` is `schemas/<stem>-options.schema.ts` exporting `<Stem>Options` (fields, types, defaults,
field decorators). `env` maps a field to its environment variable; only fields read from the
environment appear in it. `@Secret("NAME")` stays a field decorator because the secret name is a
per-field address. The class is the DI token and its key is derived; two classes that derive one key
fail gen (`identity_collision`) and a second override of one base in a member fails gen
(`override_duplicate`): there is no "last one wins". A host override keeps the base's name, imports
it as `Base<Name>` and only sets `override` field defaults:

```ts
import { LoyaltyKitConfig as BaseLoyaltyKitConfig } from "@figentra/acme-loyalty-kit";

/** Points may cover at most 30 % of an order, below the kit's 50 %. */
export class LoyaltyKitConfig extends BaseLoyaltyKitConfig {
  /** Largest share of an order total points may cover, as a whole percentage. */
  override maxRedeemPercent = 30;
}
```

A config override carries no `schema` and no `env` of its own. An app keeps every public environment
value in its one `EnvConfig`
(`export class EnvConfig extends Config({ schema: EnvOptions, env: { identityIssuer: "VITE_IDENTITY_ISSUER" } }) {}`,
the shape in `src/schemas/env-options.schema.ts`); a field named after a package config field feeds
that field (`identityIssuer` feeds `identity.issuer`, `analyticsPosthogKey` feeds
`analytics.posthogKey`), so no package config of the app reads the environment itself. Public values
use the `VITE_` or `EXPO_PUBLIC_` prefix and never hold a secret; a server secret (the web app's
Worker) is a `@Secret` field on the options schema.

Layers, lowest first: the schema defaults, the override, the environment (`env`, or the `EnvConfig`
field that feeds it), then the member runway's `environments.<env>.config.<key>`. Config is read by
constructor injection by type in a binding and `useConfig(Class)` in a component.

## Caching

One rule per case. A cached **read** is the query's `cache: { ttl, invalidateOn }` option, keyed per
principal and input by default (`per: CacheScope.Tenant` is opt-in and needs the
`expectTenantCacheSafe` test helper). A cached **value** inside a service, driver or listener is the
injected `Cache` port,
`this.cache.remember(CacheKey.of(Product, id, locale), Duration.minutes(10), load)`, forgotten by
the action that changes it. Keys are tenant-scoped by the port and filled single-flight. There is no
`@Cached`, no `ctx.cache` and no module to import: the class is the token.

## Migrations

`stackra db diff` writes the next migration from the models; you review it and may edit it before
its first merge to `main`, then it is frozen. A migration is a **snapshot**: it imports only
`@stackra/database` and `#stackra/migrations`, names tables and columns with literals, and its
compiled SQL is hash-locked in the manifest. Stackra column conventions are **macros**
(`database/macros/<name>.macro.ts`, `extends Macro`), named after their partner so a model and its
migration cannot drift: `t.hasPublicId("ord")`, `t.belongsToTenant()`, `t.money("total")`,
`t.timestamps()`. A host cannot override a macro, and a macro change that alters released SQL fails
gen.

```ts
// catalogue/database/migrations/0006-products-search-index.migration.ts
export class ProductsSearchIndexMigration extends Migration({
  after: [Migrations.search.createTextFunctions],
}) {
  /** Builds the three search indexes while writes continue. */
  up(schema: SchemaBuilder): void {
    schema.table("products", (t: Blueprint) => {
      t.index(["search_vector_en"]).using("gin").concurrently();
      t.index(["search_vector_ar"]).using("gin").concurrently();
    });
    schema.sql(
      "CREATE INDEX CONCURRENTLY idx_products_search_text_trgm ON catalogue.products " +
        "USING gin (search.unaccent_immutable(search_text) gin_trgm_ops)",
      { inverse: "DROP INDEX CONCURRENTLY IF EXISTS catalogue.idx_products_search_text_trgm" },
    );
  }
}
```

- **Down**: you write `up(schema)` only. Gen derives the inverse of every step;
  `schema.sql(statement, { inverse })` is the one hand-written inverse, and `inverse: false` marks
  an irreversible step where rollback stops (a missing `inverse` is a gen error).
  `stackra db rollback` runs only on local, preview and test databases; CI runs up, down, up;
  production is forward-only (ADR 0159).
- **Order**: the number orders a module's stream; `after: [Migrations.<module>.<stem>]` orders
  across members (only toward the member's own modules or packages it imports); a macro adds an
  implicit edge to its owner. The released prefix never moves; there is no `before`.
- **Safety classes**: Additive (one transactional step, lock 3 s, statement 30 s); Online (its own
  non-transactional step: an index on an existing table needs `.concurrently()`, a foreign key is
  added `NOT VALID` then validated); Contract (drop, rename, `setNotNull` as the four-step pattern,
  only after the model change shipped in an earlier release); Banned (table rewrites, DML, `LOCK`).
  squawk checks the compiled SQL.

## Integrations

An **Integration** describes a provider, statically, once per listing: `provider`, `category`,
`levels` (where connections sit), `auth` (a closed union of six strategies: `AuthType.OAuth2Code`,
`OAuth2ClientCredentials`, `ApiKey`, `Basic`, `Jwt`, `None`, each with its typed fields such as the
authorize and token URLs, scopes and refresh), `baseUrl`, `rateLimits`, `retry`, `health`,
`webhooks` (signature scheme, secret, event-type path) and `listing`, plus `@Secret` fields for the
platform's own credentials. A **Connection** is the shape of one stored credential set,
`extends Connection<XIntegration>`: tenant or user fields, `@Secret` fields, `check()` (proves the
credential works and returns the account label) and optional `subscribe()` and `unsubscribe()`.

- `@Secret` takes its home from its class: on an Integration or a Config it is a platform secret
  (Infisical, synced by runway); on a Connection it is a tenant secret in the connection store,
  envelope-encrypted and bound to tenant, connection and name.
- A `{field}` placeholder in `auth` or a URL resolves on the Connection first, then the Integration,
  so a tenant can bring its own key or OAuth app. A connection's webhook secret is the exception: it
  is a required Connection field and never falls back to the platform secret, so a platform-signed
  event replayed to a tenant connection's URL fails verification.
- Every inbound provider webhook is a `WebhookEvent<XIntegration>({ type })`; verification and
  routing are declared once on the Integration, and the URL is per connection.
- The managed client applies auth, the egress allowlist, rate limits and retries; refresh tokens and
  client secrets never leave the store host and never appear in jobs, events, logs, traces, error
  bodies or the browser.

## Icons, lang and the error boundary

**Icons** are `IconName` strings (`icon: "receipt"`, `<Icon name="bell" />`): Lucide 1.54.0 names in
kebab-case plus Stackra aliases, typed by
`import type { IconName } from "@stackra/icons/contracts"`. `Icon` comes from `@stackra/ui/react`
(web) or `@stackra/ui/native`. Nothing imports an icon component; gen validates names and ships only
the icons in use. A member's own icons in `assets/icons/` join as `<namespace>::<name>`.

**Lang files** are `assets/lang/<locale>/<namespace>.json`. An app's namespaces are its member key
plus one per app group that has strings (`shortcuts`, `manifest`, `pages`, `documents`, `menus`,
`enums`, …); a service or package has one file per module key. The base locales are `en` and `ar`; a
regional overlay (`en-US`, `ar-SA`) holds only the keys that differ and falls back to its base
language, then to the default. Folders use BCP 47 case and the values are `Locale.En`, `Locale.Ar`,
`Locale.EnUs` and `Locale.ArSa`; URL prefixes stay lowercase (`/ar-sa/`, ADR 0297). The locale logic
lives in three places: `@stackra/i18n` (the `Locale` values, the fallback resolution, formatting and
plural rules), the member's `src/config/i18n.config.ts` (enabled and regional locales, the fallback
chain, the URL strategy) and gen (merges overlays and consumed services' lang into `.stackra/lang/`,
emits `I18n`, and fails on a key missing from a base locale or an overlay key its base lacks).

**Errors on screen**: `@stackra/navigation` owns the root error boundary, gen wires it, its UI comes
from `@stackra/ui`, and it reports through the errors package's reporter port. An app ships no
boundary; a route adds `<name>.error.tsx` only to customise its own.

## Single owners (never import these from anywhere else)

`Controller`: no package is assigned yet · `Action`, `Query`, `Precondition`, `Interceptor`,
`ExtensionPoint`, `Extension`, `Idempotency` → `@stackra/actions` · `Schema`, `CursorInput`, `Page`,
`validate` and the field decorators → `@stackra/validation` · `Model`, relation decorators,
`Collection`, `Ref`, `Link`, `Index`, `Searchable` and the traits → `@stackra/model` ·
`StateMachine`, `Transition` → `@stackra/state-machine` · `Refusal`, `ErrorKind` → `@stackra/errors`
· `Event`, `DomainEvent`, `IntegrationEvent`, `WebhookEvent`, `AnalyticsEvent`, `Listener`,
`BroadcastAudience` → `@stackra/events` · `Change` → `@stackra/versioning` · `Workflow`, `Signal`,
`Step`, `Run` → `@stackra/workflow` · `Permissions`, `Permission`, `Policy`, `Role`, `SystemRole` →
`@stackra/iam` · `Entitlement` → `@stackra/entitlements` · `Flag` → `@stackra/feature-flags` ·
`Settings`, `Setting`, `SettingScope`, `SettingsReader` → `@stackra/settings` · `CrudService`,
`Migration`, `Macro`, `Seeder`, `Blueprint`, `SchemaBuilder` → `@stackra/database` (`Factory` from
`@stackra/database/testing`) · `Cache`, `CacheKey`, `CacheScope` → `@stackra/cache` · `Module`,
`Service`, `Driver`, `Lifetime`, `Replaces`, `Named`, `DriverName` → `@stackra/container` ·
`Config`, `Secret` → `@stackra/config` · `Resource`, `Widget`, `Document`, `Panel`, `Table`,
`Actions`, `Display`, `ActionPlace`, `TimeRange` and the metric types → `@stackra/panel` ·
`Notification`, `Recipient`, `Notifier` → `@stackra/notifications` · `Integration`, `Connection`,
`AuthType`, `ConnectionLevel`, `IntegrationCategory` → `@stackra/integrations` · `Prompt`, `Skill`,
`Facts` → `@stackra/ai` · `Route`, `Layout`, `Menu`, `MenuKind`, `ChromeConfig`, `RouteProps` →
`@stackra/navigation` · `Shortcut` → `@stackra/shortcuts` · `Store` → `@stackra/state` · `Component`
→ `#stackra/ui` · `Icon` and every other component → `@stackra/ui/react` (`@stackra/ui/native` on
mobile) · `IconName` → `@stackra/icons/contracts` · `Bridge` → `@stackra/platform/electron` ·
`Block` → `@stackra/experience` · `PublicId`, `Url`, `Email`, `Duration`, `Json`, `Tone`, `Realm`,
`ActorKind`, `ApiArea`, `HttpMethod`, `SortDirection`, `Target`, `DataClassification`, `Port`,
`Enum`, `defineApp`, `defineService`, `definePackage`, `defineWorker`, `MigrationRunner` →
`@stackra/contracts` · `Money`, `CurrencyCode` → `@stackra/money` · `StorageArea` →
`@stackra/storage` · `ColorScheme` → `@stackra/theming` · `NumberingSystem`, `Locale` →
`@stackra/i18n` · `PromptMoment`, `Capability`, `DesktopMode`, `OverlayStyle`, `OverlayAnchor` →
`@stackra/platform` · a consumed service's classes → `#stackra/clients/<service>` · `Queues`,
`Slots`, `Panels`, `Flags`, `Routes`, `I18n`, `Migrations` → `#stackra/*` · a refusal in a test is
its error class (`refusal(OrderNotPayableError)`), never a code · the theme → the product's theme
package's `themes/<key>/web.css` (web) and `themes/<key>/native.css` (mobile) with
`@stackra/tokens/fonts/fonts.css`; colours are tokens, never literals
([Stackra ADR 0302](https://docs.stackra.figentra.com/adr/0302-stackra-design-system-tokens-ui-and-the-playground)).
`zod` is imported only by generated code and the `@Field(zod)` hatch.

## Rules

- **Strings appear only where an identity is written.** Every other reference is a generated
  constant, an imported class or an enum value (`I18n.orders.enums.order_status.paid`,
  `Panels.TenantAdmin`, `CancelOrderAction`, `Permission.L2`, `ActorKind.User`). The other literals
  allowed are a `keyof`- or path-typed literal (`c.from("status")`, `d.kpi("revenue")`), a
  `DriverName<Port>` literal (`ledger: "postgres"`), an `IconName`, a field name in a class facet
  (`subjects: "customerId"`), a migration's table, column and enum literals (a snapshot) and a
  tool-owned value typed by the tool's own union. Every closed set of house values is an `Enum.of`
  in the package that owns the option, or under the app's `src/enums/` when only that app uses it;
  codes are snake_case.
- A kind base's name is reserved: a model never takes one (`Notification`, `Widget`, `Document`, …),
  so the inbox entry model is `InboxMessage`.
- A broadcast states its permission and its audience: `BroadcastAudience.Principal` (the default,
  for an event about one person) or `BroadcastAudience.Tenant` (a tenant-wide refresh). Only
  integration events broadcast.
- Keys are written short (`order.cancel`); gen adds the module and the major
  (`orders.order.cancel@1`). A breaking change to an action is `version: 2`; to an event,
  `version: 2` plus a change file beside it.
- Links point down the graph: a route names its layout by class
  (`extends Route({ path: "/", layout: ShellLayout })`), and its page class is bound by name
  (`<name>.tsx` in its folder). Layouts, menus, pages and data use the generated key
  (`Routes.dashboard` from `#stackra/routes`), never the route class. A layout has no tab list: a
  route declares `tab: { order, icon }`, and the tab bar may be rearranged in one
  `menus/tab-bar.menu.ts`.
- Classes are the only tokens. A constructor parameter names its dependency by type (`import type`),
  the constructor ends with `super()`, and `@Lifetime(Lifetime.Request)` or `Lifetime.Transient` is
  the only scope marker. A named instance is the type `Named<Port, "x">`. Never write `@Injectable`,
  `@Inject`, a providers array, `forRoot` or a string token.
- A sibling module (same member) is reached only through the classes its `Module({ exports })` lists
  and its public groups: `schemas/`, `enums/`, `events/`, `errors/`, `access/*.permissions.ts` and
  `extensions/*.extension-point.ts`; its `models/` only from `models/` (relations) and `database/`
  (factories and seeders; a migration imports no model). A test may also import a sibling's
  `database/factories/` and `models/` to arrange data. Another service is reached through its
  generated client (call or `.queue()`) or its events, never its code or its package.
- To change what you do not own: implement one slot of an extension point
  (`Extension<Point["slot"]>`), place a widget (`Widget.place`), shadow a file in
  `src/overrides/<owner>/…`, override a config in `src/config/`, or replace a binding with
  `@Replaces(Port)`. Never edit another module's file to change behaviour.
- One fact, one file. What a member IS and what only build tools read → `stackra.config.ts`. How it
  BEHAVES at run time → `src/config/*.config.ts` and its options schema. What it NEEDS per
  environment (dedicated resources with a reason, secret names, store sizes, config values, health
  thresholds) → its `runway.yaml`. WHERE it runs and how it is packed (topology groups, `isolate`,
  sizes) → the root `runway.yaml`. Versions → `pnpm-workspace.yaml` catalogs. Risk lives on the
  permission static, "who may run" in the action's `actors`, a driver choice in a config field typed
  `DriverName<Port>`, a column or an index on the model.
- Nobody writes an entry: gen writes `.stackra/entry/<target>.ts` (`createApp` from
  `@stackra/app/<target>`), the tool configs and their root shims. A code hatch lives only in
  `vite.extend.ts`, `expo.extend.ts`, `metro.extend.ts` or `electron.extend.ts`, with a `Reason:`
  header.
- Read `.stackra/gen/*.ts` and the member's `stackra.manifest.json` to see what exists; both are
  complete.
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
  `Governing contract` lists published ADR numbers only, and names a v3.1 rule as "ADR 0294 (as
  amended by programming model v3.1, AGENTS.md)". Every member, constructors included, has a
  one-line TSDoc saying what the type cannot; tests carry a docblock on every `describe` and `it`.
  `// why`, never `// what`.
- Generated files open with the short header `generated by stackra gen from <sources> — do not edit`
  and one `Purpose:` line, never the authored four-field block; a generated JSON file carries the
  same two sentences in `$comment`. YAML, TOML, JSONC and JSON5 files carry the four-field header as
  comments; a strict JSON file whose tool tolerates an extra key carries it in `$comment`
  (`.claude/launch.json`, `.changeset/config.json`). The recorded exceptions take no header because
  their tool rejects unknown keys or every key is data: `.github/rulesets/main.json` (GitHub's
  ruleset schema), every `package.json` (its `description` says what the member is),
  `assets/lang/**/*.json` (every key is a message) and the AI eval datasets under `assets/ai/`.
- Naming
  ([Stackra ADR 0231](https://docs.stackra.figentra.com/adr/0231-naming-and-casing-standard)):
  module keys one snake_case segment; verbs `get`, `list`, `search`, `stats`, qualifier last; codes
  and route keys snake_case; files kebab-case with the kind suffix; constants SCREAMING_SNAKE;
  namespace lookups `<module>::<path>`; secrets `<PROVIDER>_<PURPOSE>`; constraint names `idx_`,
  `fk_`, `ck_`.

## Commands

Every repo operation is a `stackra` command behind a root script: `pnpm gen` (after any declaration
change; commit the member's `stackra.manifest.json` and `openapi.json`), `pnpm new <kind> <name>`
(`stackra new`, which names the member after the product key), `pnpm verify` (the gate CI runs),
`pnpm validate` (with the example drift check), `pnpm structure` (the group → kind → test table),
`pnpm db:diff`, `pnpm run doctor` (`run`, because `pnpm doctor` is pnpm's own command). Agent
skills, sub-agents, rules and guard hooks are not in this repository: install them once per machine
with `stackra agents setup` (`@stackra/skills`), and read framework know-how through the Stackra MCP
server in `.mcp.yaml`.
