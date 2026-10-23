# orders

Places, cancels and expires orders. The reference module: each kind of the programming model appears
once, in its group folder. A file's path says its kind (`<group>/<name>.<kind>.ts`), its class
extends exactly one kind base, and identities (keys, permissions, events, tables, i18n keys) are
derived from names and locked in the member's `stackra.manifest.json` (Stackra ADR 0294, as amended
by the programming model v3.1). One exported declaration per file; a partner is a type argument.
Tests sit in a `__tests__/` folder beside their subject (ADR 0022) and read the ids factories return
instead of typing them.

| Group         | Files                                                                                 | Read it for                                                                        |
| ------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| (root)        | `orders.module.ts`, `orders.settings.ts`                                              | `Module({ exports })`; `Settings({ scopes, navigation })`, a section, `rules(r)`   |
| `models/`     | `order.model.ts`, `order-line.model.ts`                                               | `Model.with(traits)`, `Money`, `Ref<Order>` (foreign key), `Link<Variant>`         |
| `models/`     | `order.state-machine.ts`                                                              | `StateMachine<Order>({ field })` with `@Transition` methods that record events     |
| `actions/`    | `create-order.action.ts`                                                              | `preconditions`, `idempotency`, `tool`, `intent`, `ctx.run(CreateOrderWorkflow)`   |
| `actions/`    | `cancel-order.action.ts`                                                              | Input and Output in `schemas/`, `ctx.authorize(order)`, a queued call after commit |
| `actions/`    | `expire-unpaid-orders.action.ts`                                                      | a job: the typed `job` block (`Queues.Maintenance`, cron); the system actor only   |
| `queries/`    | `get-order.query.ts`, `list-orders.query.ts`                                          | `TableInput` and `CrudService.table`, `Page.of(OrderView)`, customer narrowing     |
| `queries/`    | `order-kpis.query.ts`, `list-order-lines.query.ts`                                    | `cache`, metric outputs from `CrudService.metrics()`; the query graph              |
| `schemas/`    | `*.schema.ts`                                                                         | every Input, Output, notification Data and settings section; type-first shapes     |
| `schemas/`    | `order-view-2027-03.change.ts`                                                        | `Change<OrderView>({ from, sunset })` beside its subject (`down` only)             |
| `enums/`      | `order-status.enum.ts`, `cancel-reason.enum.ts`                                       | `Enum.of({...})` plus the type of the same name; tones as meta                     |
| `errors/`     | `order-not-payable.error.ts`, `orders-paused.error.ts`                                | `extends Refusal({ kind })`; the code comes from the class name                    |
| `events/`     | `order-placed.event.ts`, `order-paid.event.ts`, `order-cancelled.event.ts`            | `IntegrationEvent` from @stackra/events, with `webhook` and `broadcast`            |
| `listeners/`  | `mark-order-paid.listener.ts`                                                         | subscribed by the type of `handle`'s event parameter (`PaymentCaptured`)           |
| `workflows/`  | `create-order.workflow.ts`                                                            | public async methods are steps; `@Step` only for options; `undo<Step>`             |
| `access/`     | `order.permissions.ts`, `order.policy.ts`                                             | statics with risk; `Policy<Order>` with record rules named after verbs             |
| `access/`     | `accepting-orders.precondition.ts`, `quick-order.flag.ts`                             | `extends Precondition` with `check(ctx)`; `Flag({ default, scopes, expires })`     |
| `services/`   | `order.service.ts`, `order-pricing.service.ts`                                        | `CrudService<Order>` (`table`, `metrics`); `extends Service`; `Money` arithmetic   |
| `extensions/` | `order.extension-point.ts`                                                            | the point: `adjustTotals` (`after`) and `verifyPlacement` (`before`) slots         |
| `resources/`  | `order/order.resource.ts`                                                             | `Resource<Order, OrderView>`: table, views, infolist, relations, `actions(a)`      |
| `resources/`  | `order/order-kpis.widget.ts`, `order/awaiting-payment.widget.ts`                      | `Widget<OrderKpisQuery>` with a KPI group; a resource view as a tile               |
| `resources/`  | `order/sales-overview.document.ts`                                                    | a Dashboard document: widget classes only, one range picker                        |
| `resources/`  | `order/my-orders.document.ts`                                                         | a Page document in the app area: the customer portal's orders list                 |
| `resources/`  | `order/order-placed.notification.ts`, `order/order-receipt.notification.ts`, `*.mail` | triggered by the event parameter; a class-component mail template bound by name    |
| `database/`   | `migrations/`, `factories/`, `seeders/demo.seeder.ts`                                 | snapshot migrations with partner macros; `Factory<Order>`; `static ids`            |
| `ai/`         | `order.facts.ts`, `explain-order.prompt.ts`, `orders-support.skill.ts`                | `Facts<Order>`, `Prompt`, `Skill({ tools })`; assets bound by name                 |
| `constants/`  | `draft-priced.constant.ts`                                                            | a constant in its own file, never beside a class                                   |

The member root holds what the module reads but does not own: `assets/lang/<locale>/orders.json`
(the `I18n.orders.*` tree) and `assets/ai/orders/*` (the prompt, its evaluation set and the skill
instructions).

Extending orders: the extension POINT (`extensions/order.extension-point.ts`) is the seam orders
owns, publishes and calls; an EXTENSION is one class in your own module that implements one slot of
it: `extends Extension<OrderExtensionPoint["adjustTotals"]>({ order })` with one `handle` method
(see `../loyalty`). Wrapping a whole action call is an Interceptor, not a slot. A sibling module
imports only an exported class (`OrderService`), `schemas/`, `enums/`, `events/`, `errors/` and
`access/order.permissions.ts`, plus `models/` from its own `models/` and `database/` folders for a
relation (ADR 0294 decision 24). Never edit these files to change pricing.
