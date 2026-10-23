# @acme/service-commerce

A deployable that hosts four modules of the Acme example product's commerce domain and two package
modules (`@acme/loyalty-kit`, `@acme/access-log`). It owns no behaviour of its own (ADR 0111, 0259):
the root module imports the package modules it hosts, and everything else lives in `src/modules/*`,
where each file's path says its kind and its base class takes its options (Stackra ADR 0294).

| Path                                                 | What it is                                                                                                       |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `stackra.config.ts`                                  | What the member is: API area, health checks, e2e seeder keys, migration runner (`defineService`, static data)    |
| `runway.yaml`                                        | What it needs per environment: secret names, store sizes, queue settings, health thresholds, config and drivers  |
| `stackra.manifest.json`                              | COMMITTED contract: actions, queries, events, extension points, UI, models, identities; package manifests merged |
| `openapi.json`                                       | COMMITTED projection of the manifest; one unique `operationId` per wire key (`orders.order.cancel@1`)            |
| `.stackra/`                                          | What `stackra gen` writes (gitignored; committed here to read): the entry, wiring, schemas, clients, tables, …   |
| `src/commerce.module.ts`                             | The root module: `extends Module({ imports })` with the package modules, nothing else                            |
| `src/config/commerce.config.ts`                      | `extends Config` (key `commerce`): typed fields, `@Env`, `@Secret`                                               |
| `src/config/versioning.config.ts`                    | The dated API versions; every response change names one of them                                                  |
| `src/config/{loyalty-kit,access-log}.config.ts`      | Host overrides of the package configs: `Commerce<Base>` classes with `override` members only                     |
| `src/config/{logging,realtime,rate-limit}.config.ts` | Host overrides of platform configs: log redaction, channel subscription, the public-area rate                    |
| `src/__tests__/`                                     | `commerce.module.int.test.ts` (boot on Postgres, registry matches manifest), the manifest contract test          |
| `src/modules/catalogue`                              | Products and variants; generated operations with an entitlement, search, image uploads, POS lookups              |
| `src/modules/inventory`                              | Stock levels, reservations, low-stock alerts                                                                     |
| `src/modules/orders`                                 | Orders: create (workflow), cancel, expire unpaid; the reference module for every kind                            |
| `src/modules/loyalty`                                | An extender: redeems points through an orders extension, earns through the kit's `AccountService`                |

Nobody writes a `main.ts`: gen writes `.stackra/entry/server.ts`, which passes `CommerceModule` and
the generated wiring to `createApp` (ADR 0295). Whether commerce runs alone, in a group or in a
monolith is the root runway's topology, never code.

Module dependencies are inferred: catalogue injects `StockService` (inventory), orders injects
`ProductService` (catalogue) and `StockService`, loyalty implements an orders extension point. Boot
order is therefore inventory, catalogue, orders, loyalty. A cycle, or an import of a sibling's
internals, is a gen error. Each module's tables live in its own Postgres schema (`orders.orders`)
inside the service's one database.

Drivers: a port is an abstract class; an implementation is `extends Driver(Port)` in a `drivers/`
folder and is named by its file prefix (`memory-loyalty-ledger.driver.ts` → `memory`); a config
field typed `DriverName<Port>`, in the package that owns the port, picks one, and runway sets it per
environment under `config`. A port with one candidate (`LoyaltyMembers` → `commerce`) needs no
field. A custom implementation is bound with `@Replaces(Port)`.

Other services reach commerce through the client gen builds from the manifest
(`services/notifications` uses a call, a queued call and an event listener). A service caller of
`orders.order.cancel` must act `onBehalfOf` a customer, and every such cancel is access-logged.
