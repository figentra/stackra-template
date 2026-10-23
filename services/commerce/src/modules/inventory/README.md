# inventory

Stock per variant and location, with reservations and low-stock alerts. Exports `StockService`
(reserve, release) to orders, which calls it as a workflow step with an undo, and to catalogue,
which reads `available`. Each file's path says its kind and its class extends one kind base (Stackra
ADR 0294); the orders module is the reference for every kind, so this table lists only what
inventory adds.

| Group                    | File                                                          | Shows                                                                               |
| ------------------------ | ------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| (root)                   | `inventory.module.ts`, `inventory.settings.ts`                | `Module({ exports })`; a per-tenant threshold read at call time                     |
| `models/`                | `stock-level.model.ts`                                        | another module's variant held as `PublicId<"var">`; a getter and `lockKey` (static) |
| `access/`                | `stock.permissions.ts`, `stock.policy.ts`                     | a permissions class named after the resource (`stock`), not the model; the L2 rule  |
| `enums/`                 | `stock-adjust-reason.enum.ts`                                 | an `Enum.of` used as an input field                                                 |
| `events/`                | `stock-low.event.ts`                                          | an integration event that broadcasts with `StockPermissions.read`                   |
| `errors/`                | `insufficient-stock.error.ts`                                 | `Refusal({ kind: FailedPrecondition })` with details as fields                      |
| `services/`              | `stock.service.ts`                                            | `CrudService(StockLevel)`, the `Locks` port, `level.record(event)`, the `sql` tag   |
| `types/`                 | `stock-line.type.ts`                                          | a parameter type callers satisfy without importing it                               |
| `actions/`               | `adjust-stock.action.ts`                                      | an inline write; a sets-not-increments PUT with a named permission                  |
| `queries/`               | `list-low-stock.query.ts`                                     | a read bound to a widget; Input and Output companions                               |
| `resources/stock-level/` | `low-stock.widget.ts`                                         | `Widget({ display: WidgetDisplay.list(...), refreshOn })`                           |
| `database/`              | `migrations/`, `factories/stock-level.factory.ts`, `seeders/` | the initial table; `StockLevelFactory.soldOut()`; catalogue's ids named as data     |
| tests                    | `access/__tests__/`, `services/__tests__/`                    | `createTestingModule` with memory drivers, `toRefuseWith`, `toRecord`               |

The member root holds what the module reads but does not own: `assets/lang/<locale>/inventory.json`,
the `I18n.inventory.*` tree.
