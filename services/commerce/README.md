# @acme/service-commerce

A deployable that hosts four modules of the Acme example product's commerce domain and two package
modules (`@acme/loyalty-kit`, `@acme/access-log`). It owns no behaviour of its own (ADR 0111, 0259)
and authors no root module: its modules are the folders of `src/modules/*`, its package imports are
the `package.json` dependencies that ship a module, and gen writes `CommerceModule` from both. Each
file's path says its kind, its base class takes its options, and a partner class is a type argument
(`Policy<Order>`, `Resource<Order, OrderView>`, `CrudService<Order>`), never a value passed in
(Stackra ADR 0294, as amended by the programming model v3.1).

| Path                                                 | What it is                                                                                                                                                |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stackra.config.ts`                                  | What the member is: API area, health checks, e2e seeder keys, migration runner (`defineService`, static data)                                             |
| `runway.yaml`                                        | What it needs per environment: a dedicated cache (`requires`, with its reason), secret names, sizes, config values                                        |
| `stackra.manifest.json`                              | COMMITTED contract: actions with their surfaces, events, extension slots, UI, settings, migrations, identities                                            |
| `openapi.json`                                       | COMMITTED projection of the manifest; one unique `operationId` per wire key (`orders.order.cancel@1`)                                                     |
| `.stackra/`                                          | What `stackra gen` writes (gitignored; committed here to read): the entry, the member module, wiring, clients, …                                          |
| `src/config/commerce.config.ts`                      | `extends Config({ schema: CommerceOptions, env })` (key `commerce`); the shape is `src/schemas/`                                                          |
| `src/config/versioning.config.ts`                    | The dated API versions (`VersioningOptions`); every response change names one of them                                                                     |
| `src/config/{loyalty-kit,access-log}.config.ts`      | Host overrides of the package configs: `LoyaltyKitConfig extends BaseLoyaltyKitConfig`, `override` members only                                           |
| `src/config/{logging,realtime,rate-limit}.config.ts` | Host overrides of platform configs in the same `Base` alias form: log redaction, subscription, public-area rate                                           |
| `src/schemas/`                                       | The config shapes (`CommerceOptions` with its `@Secret("PRICING_API_KEY")`, `VersioningOptions`)                                                          |
| `src/__tests__/`                                     | `commerce.module.int.test.ts` (boot on Postgres, registry matches manifest), the manifest contract test                                                   |
| `src/modules/catalogue`                              | Products and variants; a resource with a wizard, import and views; search, image uploads, POS lookups                                                     |
| `src/modules/inventory`                              | Stock levels, reservations, low-stock alerts and the low-stock widget                                                                                     |
| `src/modules/orders`                                 | Orders: create (workflow), cancel, expire unpaid; the KPI band; the reference module for every kind                                                       |
| `src/modules/loyalty`                                | An extender: holds points atomically in orders' `reservePlacement` slot, settles and releases them by listeners, earns through the kit's `AccountService` |

Nobody writes a `main.ts`: gen writes `.stackra/entry/server.ts`, which passes the generated
`CommerceModule` (`#stackra/module`) and the generated wiring to `createApp` (ADR 0295). Whether
commerce runs alone, in a group or in a monolith is the root runway's topology, never code; the one
member fact about resources is the dedicated cache `runway.yaml` requires, because the query cache
and the rate-limit counters need their own eviction policy.

Module dependencies are inferred: catalogue injects `StockService` (inventory), orders injects
`ProductService` (catalogue) and `StockService`, loyalty implements orders' extension slots. Boot
order is therefore inventory, catalogue, orders, loyalty. A cycle, or an import of a sibling's
internals, is a gen error. Each module's tables live in its own Postgres schema (`orders.orders`)
inside the service's one database; migrations are frozen snapshots that name tables and columns with
literals, order across members with `after:` and never author a `down()`.

Every action and query declares its surfaces as typed options defaulted from its key and actors:
`endpoint` (derived from the key), `tool` (MCP; queries by default, actions with `tool: true`),
`job` (a typed block with its queue and cron) and `intent` (phrases in
`assets/lang/<locale>/<module>.json`, so both locales ship). A cached read is a query's `cache:`
option; a cached value inside a service is the injected `Cache` port with `CacheKey.of(...)`
(`ProductService#view`).

Drivers: a port is an abstract class; an implementation is `extends Driver(Port)` in a `drivers/`
folder and is named by its file prefix (`memory-loyalty-ledger.driver.ts` → `memory`); a config
field typed `DriverName<Port>`, in the package that owns the port, picks one, and runway sets it per
environment under `config`. A port with one candidate (`LoyaltyMembers` → `commerce`) needs no
field. A custom implementation is bound with `@Replaces(Port)`.

Other services reach commerce through the client gen builds from the manifest
(`services/notifications` uses a call, a queued call and an event listener, importing `OrderPaid`,
`GetOrderQuery` and `CancelOrderAction` by name from `#stackra/clients/commerce`). A service caller
of `orders.order.cancel` must act `onBehalfOf` a customer, and every such cancel is access-logged.
