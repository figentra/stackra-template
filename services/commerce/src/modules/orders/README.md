# orders

Places, cancels and expires orders. The reference module: every kind of the programming model appears once. Tests
sit in a `__tests__/` folder beside their subject's kind folder (ADR 0022), carry intent docblocks (ADR 0007) and read
the ids factories return instead of typing them.

| Kind           | File                                                                              | Read it for                                                                          |
| -------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| model          | `models/order.model.ts`, `models/order-line.model.ts`                             | `@Model()`, `Model.with(traits)`, every index as `@Index` (ADR 0159)                 |
| state          | `states/order.state.ts`                                                           | the state family on `@stackra/state-machine`: `canCancel`, recording transitions     |
| enum           | `enums/order-status.enum.ts`, `enums/cancel-reason.enum.ts`                       | class enums: cases with i18n labels, `schema` codec, identity comparison             |
| schema         | `schemas/*.schema.ts`                                                             | one schema per file (ADR 0006): `CreateOrderInput`, `CreateOrderOutput`, `OrderView` |
| error          | `errors/*.error.ts`                                                               | `AppError` subclasses with an `ErrorCategory`; codes are snake_case                  |
| permission     | `permissions/order.permission.ts`                                                 | `@Permissions(Order)`; risk lives here only (ADR 0132)                               |
| event          | `events/*.event.ts`                                                               | one `@Event` per file; `OrderPaid` broadcasts and is an outbound webhook             |
| hook point     | `hooks/order.hook-point.ts`                                                       | a `@HookPoint` class: `adjustTotals` (transform), `verifyPlacement` (verify)         |
| repository     | `repositories/order.repository.ts`                                                | `@RepositoryOf(Order)`: named reads, no behaviour                                    |
| service        | `./services/order.service.ts`, `./services/order-pricing.service.ts`              | `@Crud`, transitions, `@AccessLogged`, `Money` arithmetic, the `Logger` port         |
| policy         | `policies/order.policy.ts`                                                        | a method per verb; a `Service` actor is judged as the customer it acts for           |
| guard          | `guards/tenant-active.guard.ts`                                                   | `extends Guard`, listed on the write actions                                         |
| action         | `actions/create-order.action.ts`                                                  | `runs: CreateOrderWorkflow`, `idempotency`, `offline`, `UxAfter.OpenRecord`          |
| action         | `actions/cancel-order.action.ts`                                                  | inline action, `ctx.authorize`, queued command after commit, `onBehalfOf`            |
| job            | `actions/expire-unpaid-orders.action.ts`                                          | `@AsJob` + `@Cron`; `actors: [ActorKind.System]`, `time.subMinutes`                  |
| query          | `queries/get-order.query.ts`, `queries/list-orders.query.ts`                      | reads; the list is cursor-paginated and narrows customers                            |
| query          | `queries/orders-today.query.ts`                                                   | `cache: { ttl, invalidateOn: [OrderPaid] }`                                          |
| query          | `queries/list-order-lines.query.ts`                                               | `GraphQuery.through(Link)` across a module boundary                                  |
| link           | `links/order-line-variant.link.ts`                                                | `@Link` with relation properties: the one place a sibling's model is named           |
| workflow       | `workflows/create-order.workflow.ts`                                              | `@Workflow`, `@Step<W>` with a typed `compensate`, `Backoff.Exponential`             |
| listener       | `listeners/send-order-confirmation.listener.ts`, `send-order-receipt.listener.ts` | the producer renders, the `Mailer` port delivers (ADR 0223)                          |
| listener       | `listeners/mark-order-paid.listener.ts`                                           | `@OnEvent(Payments.events.PaymentCaptured)`, filtered by `Order.idPrefix`            |
| module         | `orders.module.ts`                                                                | `@Module({ key, exports })`                                                          |
| migration      | `migrations/*.migration.ts`                                                       | `stackra db diff` output from the models; immutable once committed                   |
| factory        | `factories/*.factory.ts`                                                          | `Factory<Order>` with `definition(faker)` and named states                           |
| seed           | `seeds/demo.seed.ts`                                                              | seeder key `orders.demo`, deterministic ids for docs and e2e                         |
| resource       | `resources/order.resource.ts`                                                     | `@Resource(Order)` with `table(t)` and `infolist(i)`                                 |
| setting, flag  | `settings/order.setting.ts`, `settings/quick-order.flag.ts`                       | `@Settings` with `SettingScope` cases; `@Flag` is a settings kind                    |
| widget         | `widgets/revenue-today.widget.ts`                                                 | `@Widget` bound to a query and an override point, `SystemRole` roles                 |
| document       | `documents/sales-today.document.ts`                                               | `@Document`: an L2 page composed of this module's widget and a table                 |
| mail           | `mails/order-placed.mail.tsx`, `mails/order-receipt.mail.tsx`                     | `@Mail` React Email templates; the receipt shows an ICU plural                       |
| override point | `override-points/*.point.ts`                                                      | `@OverridePoint` declarations an app binds with `@Override` (ADR 0264)               |
| version        | `versions/order-view-2027-03.change.ts`                                           | a dated `@Change` response transform (no `@n` in keys)                               |
| ai             | `ai/order.facts.ts`, `ai/*.prompt.ts`, `ai/*.skill.ts`                            | `@Facts`, `@Prompt`, `@Skill`; tools referenced by class                             |
| assets         | member root `assets/lang/<locale>/orders.json`, `assets/ai/orders/*`              | `I18n.orders.*` and `Assets.orders.*` are generated from these                       |

Extending orders: implement a point of `hooks/order.hook-point.ts` in your own module (see `../loyalty`). A sibling
module imports only an exported class, a declaration file (`events/`, `hooks/*.hook-point.ts`, `enums/`, `schemas/`,
`errors/`, `permissions/`) or, inside `links/`, a model (the sibling rule, guides/programming-model.mdx#reaching-a-sibling-module). Never edit these files to
change pricing.
