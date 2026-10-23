# orders

Places, cancels and expires orders. The reference module: each kind of the programming model appears
once, in its group folder. A file's path says its kind (`<group>/<name>.<kind>.ts`), its class
extends exactly one kind base, and identities (keys, permissions, events, tables, i18n keys) are
derived from names and locked in the member's `stackra.manifest.json` (Stackra ADR 0294). Tests sit
in a `__tests__/` folder beside their subject (ADR 0022) and read the ids factories return instead
of typing them.

| Group         | Files                                                                                 | Read it for                                                                       |
| ------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| (root)        | `orders.module.ts`, `orders.settings.ts`                                              | `extends Module({ exports })`; `extends Settings({ scopes })`, `@Renamed`         |
| `models/`     | `order.model.ts`, `order-line.model.ts`                                               | `Model.with(traits)`, `Money`, `Ref<Order>` (foreign key), `Link<Variant>`        |
| `models/`     | `order.state-machine.ts`                                                              | `StateMachine(Order, { field })` with `@Transition` methods that record events    |
| `actions/`    | `create-order.action.ts`                                                              | `preconditions`, `idempotency`, `offline`, `ctx.run(CreateOrderWorkflow, input)`  |
| `actions/`    | `cancel-order.action.ts`                                                              | Input and Output companions, `ctx.authorize(order)`, a queued call after commit   |
| `actions/`    | `expire-unpaid-orders.action.ts`                                                      | a job: the `job` option with its queue and cron; the system actor only            |
| `queries/`    | `get-order.query.ts`, `list-orders.query.ts`                                          | `CursorInput`, `Page.of(OrderView)`, customer narrowing                           |
| `queries/`    | `orders-today.query.ts`, `list-order-lines.query.ts`                                  | the `cache` option; `endpoint` overrides; the query graph across a link           |
| `schemas/`    | `*.schema.ts`                                                                         | type-first shapes: `@Int` on every `number`, `?:` optional, `T \| null` nullable  |
| `schemas/`    | `order-view-2027-03.change.ts`                                                        | a dated response change beside its subject (`down` only)                          |
| `enums/`      | `order-status.enum.ts`, `cancel-reason.enum.ts`                                       | `Enum.of({...})` plus the type of the same name; tones as meta                    |
| `errors/`     | `order-not-payable.error.ts`, `orders-paused.error.ts`                                | `extends Refusal({ kind })`; the code comes from the class name                   |
| `events/`     | `order-placed.event.ts`, `order-paid.event.ts`, `order-cancelled.event.ts`            | `IntegrationEvent({ name, webhook, broadcast })` with typed fields                |
| `listeners/`  | `mark-order-paid.listener.ts`                                                         | subscribed by the type of `handle`'s event parameter (`Payments.PaymentCaptured`) |
| `workflows/`  | `create-order.workflow.ts`                                                            | public async methods are steps; `undo<Step>`; `@Step({ retry })`; `output(run)`   |
| `access/`     | `order.permissions.ts`, `order.policy.ts`                                             | statics with risk; record rules named after verbs                                 |
| `access/`     | `accepting-orders.precondition.ts`, `quick-order.flag.ts`                             | `extends Precondition` with `check(ctx)`; `Flag({ default, scopes, expires })`    |
| `services/`   | `order.service.ts`, `order-pricing.service.ts`                                        | `CrudService(Order)` with named reads; `extends Service`; `Money` arithmetic      |
| `extensions/` | `order.extension-point.ts`                                                            | `adjustTotals` (transform) and `verifyPlacement` (verify)                         |
| `resources/`  | `order/order.resource.ts`                                                             | `Resource(Order, { area, navigation, operations })` with `override table(t)`      |
| `resources/`  | `order/revenue-today.widget.ts`, `order/sales-today.document.ts`                      | a query bound to the built-in Kpi display; a dashboard document                   |
| `resources/`  | `order/order-placed.notification.ts`, `order/order-receipt.notification.ts`, `*.mail` | triggered by the event parameter; a mail template bound by name                   |
| `database/`   | `migrations/`, `factories/`, `seeders/demo.seeder.ts`                                 | forward-only migrations numbered per module; Laravel factories; `static ids`      |
| `ai/`         | `order.facts.ts`, `explain-order.prompt.ts`, `orders-support.skill.ts`                | `Facts(Order)`, `Prompt`, `Skill({ tools })`; assets bound by name                |

The member root holds what the module reads but does not own: `assets/lang/<locale>/orders.json`
(the `I18n.orders.*` tree) and `assets/ai/orders/*` (the prompt, its evaluation set and the skill
instructions).

Extending orders: implement a point of `extensions/order.extension-point.ts` in your own module with
`extends Extension(OrderExtensionPoint, { order })` (see `../loyalty`). A sibling module imports
only an exported class (`OrderService`), `schemas/`, `enums/`, `events/`, `errors/` and
`access/order.permissions.ts`, plus `models/` from its own `models/` and `database/` folders for a
relation (ADR 0294 decision 24). Never edit these files to change pricing.
