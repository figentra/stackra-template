# @acme/loyalty-kit

A generic capability kit (ADR 0259 home A) at `packages/commerce/loyalty-kit` (`tier:lib`, category
`commerce`): points accounts, tiers, earning and redemption maths, no product business rule. It is
also the **shapes catalogue** for packages: every kind a package can hold appears here once, in the
programming model of ADR 0294: **the path says the kind, the base class is the kind, the types give
the shape, and names give identity.**

A kit is a service module plus entry folders: `src/node/` holds the same group folders as a service
module (`services/commerce/src/modules/<key>/`), so a file moves between the two without relearning
placement. `src/contracts/` is the leaf, `src/core/` the isomorphic code, `src/react/` the
renderers, `src/testing/` the test helpers.

## Use

```ts
// services/commerce/src/commerce.module.ts
export class CommerceModule extends Module({ imports: [LoyaltyKitModule] }) {}

// services/commerce/src/config/loyalty-kit.config.ts: only what differs from the package
export class CommerceLoyaltyKitConfig extends LoyaltyKitConfig {
  override maxRedeemPercent = 30;
}

// anywhere in the host: a class is its own token
constructor(private readonly accounts: AccountService) { super(); }
await this.accounts.earn(memberId(event.customerId), { amountMinor, currency, reference });

// the host's one obligation: the members port's only driver, so no config field selects it
// services/commerce/src/modules/loyalty/drivers/commerce-loyalty-members.driver.ts
export class CommerceLoyaltyMembersDriver extends Driver(LoyaltyMembers) { … }
```

## Entries

| Entry         | Holds                                                                                                                                                                            |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.`           | `LoyaltyKitConfig` and `LoyaltyKitConfig$`, `LoyaltyService`, `MemoryLoyaltyLedgerDriver`, `memberId`, the refusals, the shared shapes, the constants (isomorphic)               |
| `./contracts` | the ports `LoyaltyLedger` (the kit drives it) and `LoyaltyMembers` (the host implements it), the enums `LoyaltyTier` and `EntryKind`, the types                                  |
| `./node`      | `LoyaltyKitModule`, `LoyaltyKitSettings`, the access classes, actions, queries, events, extensions, listener, models, resources, services, workflow, postgres driver, migrations |
| `./react`     | the renderers `PointsBalance` and `PointsIssued` of the kit's two Custom widgets, and `usePointsBalance`; never imports `./node`                                                 |
| `./testing`   | `LoyaltyMembersFake.with()`, `LoyaltyAccountFactory`, `LedgerEntryFactory`, `pointsEntry`, `toHaveBalance`, `LoyaltyKitDemoSeeder` and its `ids`                                 |
| `./assets/*`  | `loyalty_kit::` translations (`assets/lang/<locale>/loyalty_kit.json`)                                                                                                           |

No symbol is exported from two entries; factories and the demo seeder live in `src/node/database/`
but only `./testing` exports them, so Faker never reaches a server. Nobody writes an entry barrel:
gen writes `.stackra/entry/{index,contracts,node,react,testing}.ts`, and `package.json` `exports`
point at them. The tsdown and Vitest configs are generated into `.stackra/` with gitignored root
shims. `stackra.manifest.json` at the member root is the committed contract; `.stackra/gen/*` is
committed in the template only so it can be read, and is imported as `#stackra/<name>`.

## Shapes index

| Kind                       | Path                                                                             | Base                                     | Test                                                                |
| -------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------- |
| port                       | `contracts/ports/loyalty-ledger.port.ts`                                         | `abstract class … extends Port`          | the driver tests and the module test                                |
| enum                       | `contracts/enums/loyalty-tier.enum.ts`                                           | `Enum.of` and a same-named type          | the extension test reads its meta                                   |
| type                       | `contracts/types/points-entry.type.ts`                                           | an interface in the leaf                 | none                                                                |
| config                     | `config/loyalty-kit.config.ts`                                                   | `Config`; `DriverName<LoyaltyLedger>`    | the module test sets `ledger`                                       |
| constant                   | `core/constants/max-points-per-entry.constant.ts`                                | none                                     | none                                                                |
| function                   | `core/functions/member-id.function.ts`                                           | none (a function kind)                   | none                                                                |
| error                      | `core/errors/insufficient-points.error.ts`                                       | `Refusal({ kind })`                      | asserted with `toRefuseWith`                                        |
| schema                     | `core/schemas/redeem-points-input.schema.ts`                                     | `Schema`                                 | through the action and workflow tests                               |
| service                    | `core/services/loyalty.service.ts`, `node/services/account.service.ts`           | `Service`, `CrudService(LoyaltyAccount)` | `core/services/__tests__/`, `node/services/__tests__/`              |
| driver                     | `core/drivers/memory-…`, `node/drivers/postgres-…`                               | `Driver(LoyaltyLedger)`, named by file   | `node/drivers/__tests__/postgres-loyalty-ledger.driver.int.test.ts` |
| named instance             | `node/services/ledger-reconciler.service.ts`                                     | `Named<LoyaltyLedger, "primary">`        | none                                                                |
| module                     | `node/loyalty-kit.module.ts`                                                     | `Module({ exports })`                    | `node/__tests__/loyalty-kit.module.test.ts`                         |
| settings                   | `node/loyalty-kit.settings.ts`                                                   | `Settings({ scopes })`                   | faked with `fakeSettings`                                           |
| permissions, policy        | `node/access/loyalty-account.permissions.ts`, `.policy.ts`                       | `Permissions`, `Policy(Permissions)`     | `node/access/__tests__/loyalty-account.policy.test.ts`              |
| model                      | `node/models/loyalty-account.model.ts`                                           | `Model.with(...traits)`                  | through the factories                                               |
| action                     | `node/actions/enroll-member.action.ts`                                           | `Action({ key })`                        | `node/actions/__tests__/enroll-member.action.test.ts`               |
| job                        | `node/actions/expire-points.action.ts`                                           | `Action({ key, job })`                   | through `run`                                                       |
| query                      | `node/queries/get-balance.query.ts`                                              | `Query({ key, cache })`                  | `node/queries/__tests__/get-balance.query.test.ts`                  |
| event, version change      | `node/events/points-earned.event.ts`, `points-earned-v1.change.ts`               | `IntegrationEvent`, `Change(Event)`      | the manifest contract test                                          |
| domain event               | `node/events/points-redeemed.event.ts`                                           | `DomainEvent`                            | through the balance query test                                      |
| listener                   | `node/listeners/recalculate-tier.listener.ts`                                    | `Listener`                               | `node/listeners/__tests__/recalculate-tier.listener.test.ts`        |
| extension point, extension | `node/extensions/loyalty-kit.extension-point.ts`, `tier-multiplier.extension.ts` | `ExtensionPoint`, `Extension(Point)`     | `node/extensions/__tests__/tier-multiplier.extension.test.ts`       |
| workflow, signal           | `node/workflows/redeem-points.workflow.ts`, `redemption-confirmed.signal.ts`     | `Workflow<Input>`, `Signal`              | `node/workflows/__tests__/redeem-points.workflow.int.test.ts`       |
| resource, widget, document | `node/resources/loyalty-account/`                                                | `Resource(Model)`, `Widget`, `Document`  | the console e2e tier                                                |
| migration                  | `node/database/migrations/0001-create-loyalty-tables.migration.ts`               | `Migration`                              | the `.int` tier applies it                                          |
| factory, seeder            | `node/database/factories/`, `node/database/seeders/demo.seeder.ts`               | `Factory(Model)`, `Seeder`               | used by every seeded test                                           |
| renderer                   | `react/points-balance/points-balance.tsx`                                        | a function, bound by the widget's name   | `react/points-balance/__tests__/points-balance.test.tsx`            |
| fake, matcher              | `testing/loyalty-members.fake.ts`, `testing/to-have-balance.matcher.ts`          | `Fake.of(Port)`, `createMatcher`         | `testing/__tests__/to-have-balance.matcher.test.ts`                 |
| fixture                    | `testing/points-entry.fixture.ts`                                                | `factory<DTO>()` (not a `.factory.ts`)   | none                                                                |

A service shows the kinds a package does not: `ai/`, `raw/`, notifications and dated response
changes. The `@AccessLogged` facet and an Explorer are in `packages/security/access-log`.

## Rules this package demonstrates

- **A port is an abstract class and its own token**: no `@Inject`, no string token. Drivers extend
  `Driver(Port)` and are named by their file prefix; a `DriverName<Port>` config field picks one, so
  a typo is a type error; a host replaces the class with `@Replaces(Port)`. A port with one
  candidate (`LoyaltyMembers`, the host's) needs no field.
- **Names give identity**: the action keys (`account.enroll`, `points.redeem`) are written once;
  permissions, tables, i18n keys, the signal key and the settings group are derived from names and
  locked in `stackra.manifest.json`. The kit's action keys name other aggregates than the model, so
  each action names its permission.
- **Risk lives on the permission** and "who may run" in `actors`; `expire` is a system permission no
  role may grant.
- **One earn path**: a host calls
  `AccountService.earn(memberId(…), { amountMinor, currency, reference })`, which enrolls on the
  first earn, runs the `earnAdjust` chain (the tier multiplier), appends to the ledger and records
  `points.earned`; RecalculateTierListener then promotes, and never demotes.
  `LoyaltyService.quoteEarn` is the pure maths and writes nothing.
- **Versioned events, unversioned keys**: `points.earned` is `.v2` through `version: 2`; the change
  file beside it converts both ways, so v1 is published until its sunset. Domain events are never
  versioned.
- **Areas, not panels**: the resource is in the admin area, the "My points" document in the app
  area; a package never names an app's panel.
- **The model is the one source of the schema**: columns and every index are on the models, each
  module's tables live in its own Postgres schema (`loyalty_kit`), and `stackra db diff` writes the
  migrations, which are immutable once committed.
- **Memory first** (ADR 0266): the memory driver ships in `.` and the fake in `./testing`; the
  `.int` test proves the postgres driver, built on `@stackra/ledger`'s journal, keeps the same
  contract.
- **Redemption waits, it never sleeps**: the redeem run parks before its `confirm` step
  (`waitFor: RedemptionConfirmed`, correlated on member and reference, 15 minutes) until the host
  calls `loyalty_kit.points.confirm_redemption`; without it, the engine undoes the debit. No step
  body waits, so the same graph runs on any workflow engine (ADR 0152 decision 1).
- **Publishing**: `publishConfig` (with `exports` pointing at `dist`) plus a changeset; a package
  has no `runway.yaml`. `stackra.config.ts` is `definePackage({})`: the key, the entries and the
  root module are all derived.
