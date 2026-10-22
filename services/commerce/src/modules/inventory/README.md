# inventory

Stock per variant and location, with reservations and low-stock alerts. Exports `StockService` (reserve, release) to
orders, which calls it as a compensated workflow step, and to catalogue, which reads `available`.

| Kind       | File                                            | Shows                                                                          |
| ---------- | ----------------------------------------------- | ------------------------------------------------------------------------------ |
| model      | `models/stock-level.model.ts`                   | a model keyed by another module's public id; `lockKey` for the lock (ADR 0149) |
| enum       | `enums/stock-adjust-reason.enum.ts`             | a class enum used as an input field (`StockAdjustReason.schema`)               |
| schema     | `schemas/*.schema.ts`                           | one schema per file for the action and the query                               |
| permission | `permissions/stock.permission.ts`               | `@Permissions({ resource: "stock" })`: the non-model form                      |
| policy     | `policies/stock.policy.ts`                      | the L2 `manage` verb                                                           |
| event      | `events/stock-low.event.ts`                     | a `DomainEvent` (never leaves the service) that is `broadcast` to consoles     |
| error      | `errors/insufficient-stock.error.ts`            | an `AppError` subclass                                                         |
| repository | `repositories/stock-level.repository.ts`        | the `sql` tag inside a repository: the one sanctioned raw escape               |
| setting    | `settings/inventory.setting.ts`                 | a per-tenant threshold read at call time                                       |
| service    | `./services/stock.service.ts`                   | `@WithLock` with `StockLevel.lockKey`, `level.record(event)`, compensation     |
| action     | `actions/adjust-stock.action.ts`                | an inline write; a sets-not-increments PUT                                     |
| query      | `queries/list-low-stock.query.ts`               | a read bound to a widget                                                       |
| widget     | `widgets/low-stock.widget.ts`                   | `@Widget` with a panel `display`, `refreshOn` a domain event                   |
| seed       | `seeds/demo.seed.ts`                            | seeder key `inventory.demo`; catalogue's ids named as data                     |
| factory    | `factories/stock-level.factory.ts`              | `Factory<StockLevel>`                                                          |
| migration  | `migrations/0001-create-inventory.migration.ts` | diff output of the initial table                                               |
| tests      | `./services/__tests__/stock.service.test.ts`    | `createTestingModule` with memory drivers, `toRefuseWith`, `toRecord`          |
