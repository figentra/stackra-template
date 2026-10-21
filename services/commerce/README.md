# @figentra/service-commerce

A deployable that hosts four modules (a subset of the real commerce catalogue in figentra-os) and two package modules
(`@stackra/loyalty-kit`, `@stackra/access-log`). It owns no behaviour of its own (ADR 0111, 0259): the root module
imports the package modules it hosts; everything else is in `src/modules/*` and discovered by kind folder and decorator.

| Path                                                 | What it is                                                                                                   |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `stackra.config.ts`                                  | What the member IS: key, root module, area, health checks, e2e seeder keys                                   |
| `runway.yaml`                                        | How and where it runs, per environment: ports, scaling, drivers (`drivers.mail` is the mail choice), buckets |
| `.stackra/app-manifest.json`                         | COMMITTED contract: actions, events, hooks, UI, drivers, `infra`; package manifests merged in (ADR 0158)     |
| `.stackra/openapi.json`                              | COMMITTED projection of the manifest; one unique `operationId` per wire key, public paths under `/public`    |
| `.stackra/gen/`                                      | What `stackra gen` writes (gitignored; committed here to read): wiring, clients, crud, tables, i18n, …       |
| `src/main.ts`                                        | `createApp(CommerceModule, { wiring })`                                                                      |
| `src/commerce.module.ts`                             | Root `@Module({ key, imports })`: the package modules, no `forRoot`, no providers list                       |
| `src/config/commerce.config.ts`                      | `@Config` class: field decorators, `@Env`, `@Secret`; no driver field (ADR 0266)                             |
| `src/config/versioning.config.ts`                    | The dated API versions; every `@Change` names one of them                                                    |
| `src/config/{loyalty-kit,access-log}.config.ts`      | Host layers over package defaults through `override`, only what differs                                      |
| `src/config/{logging,realtime,rate-limit}.config.ts` | Host layers over platform packages: log redaction, channel subscription, the public-area rate                |
| `src/contracts/index.ts`                             | The `./contracts` entry: types and codes gen reads to write the manifest                                     |
| `src/__tests__/`                                     | `commerce.module.int.test.ts` (boot on Postgres, registry matches manifest), the manifest contract test      |
| `src/modules/catalogue`                              | Products and variants; `@Crud` with an entitlement, search index, image uploads, POS lookups                 |
| `src/modules/inventory`                              | Stock levels, reservations, low-stock alerts                                                                 |
| `src/modules/orders`                                 | Orders: create (workflow), cancel, expire unpaid; the reference module for every kind                        |
| `src/modules/loyalty`                                | An extender: redeems points through a hook, earns through the kit's `AccountService`                         |

Module dependencies are inferred: catalogue injects `StockService` (inventory), orders injects `ProductService`
(catalogue) and `StockService`, loyalty implements an orders hook point. Boot order is therefore inventory, catalogue,
orders, loyalty. A cycle, or an import of a sibling's internals, is a gen error.

Drivers: a port is an abstract class; implementations register with `@Driver(Port, name)`; one `@DriverOf` field, in
the package that owns the port, picks one by a checked name literal, and runway `drivers.<capability>` sets it per
environment. A port with one candidate (`LoyaltyMembers` → `commerce`) needs no selector. A custom implementation is
`@Replaces(Class)`.

Other services reach commerce through the client gen builds from the manifest (`services/notifications` uses call,
`.queue()` and `@OnEvent`). A service caller of `orders.order.cancel` must act `onBehalfOf` a customer, and every such
cancel is access-logged.
