# @acme/loyalty-kit

A generic capability kit (ADR 0259 home A) at `packages/commerce/loyalty-kit` (`tier:lib`, category
`commerce`): points accounts, tiers, earning and redemption maths, no product business rule. It is
also the **shapes catalogue**: every declaration kind a package can hold appears here once, in its
own file and kind folder (ADR 0128), in the decorator authoring model (ADR 0094): **everything with identity is a
class with a kind decorator; strings declare, values reference; the define family is retired.**

A kit is a service module plus a runtime split: the kind folders under `node/` are the kind folders
of a service module (`services/commerce/src/modules/<key>/`), so a file moves between the two
without relearning placement. `core/` holds the isomorphic kinds, `react/` the components,
`testing/` the helpers.

| Entry         | Holds                                                                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.`           | `LoyaltyKitConfig`, `LoyaltyService`, `MemoryLoyaltyLedger`, `memberId`, the override points, the schema classes, the errors, the constant (isomorphic) |
| `./contracts` | the ports `LoyaltyLedger` (the kit drives it) and `LoyaltyMembers` (the host implements it), the types, the enums                                       |
| `./node`      | `LoyaltyKitModule`, `AccountService`, `LedgerReconcilerService`, models, the postgres driver, actions, queries, events, the redemption signal, hooks, permissions, settings, migrations |
| `./react`     | the `PointsBalance` and `PointsIssued` components, the hook, and the `@Override` classes that register them; never imports `#node/*`                    |
| `./testing`   | `FakeLoyaltyMembers.with()`, `LoyaltyAccountFactory`, `LedgerEntryFactory`, `pointsEntry`, `toHaveBalance`, `DemoSeeder` and its `ids`; needs the optional peer `@stackra/testing`, and no runtime entry imports it, so Faker never reaches a server |
| `./assets/*`  | `loyalty_kit::` translations (`assets/lang/<locale>/loyalty_kit.json`)                                                                                  |

No symbol is exported from two entries: contracts is ports, types and enums only (no functions);
schemas, the config class, `memberId` and the isomorphic override points come from `.` only.

`.stackra/app-manifest.json` is the committed contract; `.stackra/gen/*` (`i18n`, `tables`,
`wiring`, `permissions`, `queues`, `slots`, `crud`, `manifest`) is committed in the
template only so it can be read, and is imported as `#stackra/<name>`.

## Shapes index

Kind → folder → file suffix → example → the test that proves it (`pnpm new <kind> <name>` in a
package takes `--entry core|node|react|testing`). A kind folder appears with its first file;
`enums/ errors/ interfaces/ types/ constants/ functions/` with their second (ADR 0130 d2 names
`interfaces/ types/ constants/ errors/`; the kit applies the same rule to the other two); the
catalogue shows every folder regardless. The last column says what a real kit usually holds: **yes**
for the kinds almost every kit has, **sometimes** for the kinds a kit adds when it owns that
concern, **catalogue** for the kinds shown here only so the shape exists once.

| Kind                                             | Folder                             | Suffix                       | Example                                                   | Usually present | Test                                                           |
| ------------------------------------------------ | ---------------------------------- | ---------------------------- | --------------------------------------------------------- | --------------- | -------------------------------------------------------------- |
| port (abstract class = token)                    | `src/contracts/`                   | `.port.ts`                   | `contracts/loyalty-ledger.port.ts`                        | yes             | none; the driver tests and the module test prove it            |
| config (`@Config`, `@DriverOf`, named)           | `src/config/`                      | `.config.ts`                 | `config/loyalty-kit.config.ts`                            | yes             | none; the module test compiles it                              |
| enum (class, `Enum.case`)                        | `src/core/enums/`                  | `.enum.ts`                   | `core/enums/loyalty-tier.enum.ts`                         | yes             | none; the hook test reads `meta`                               |
| schema (`Schema(z)` class, one per file)         | `src/core/schemas/`                | `.schema.ts`                 | `core/schemas/redeem-points-input.schema.ts`              | yes             | none; the action tests and the contract test cover it          |
| error (`AppError` subclass)                      | `src/core/errors/`                 | `.error.ts`                  | `core/errors/insufficient-points.error.ts`                | yes             | none; asserted with `toRefuseWith` in the caller's test        |
| interface (DTO, options)                         | `src/core/interfaces/`             | `.interface.ts`              | `core/interfaces/points-entry.interface.ts`               | yes             | none                                                           |
| type (branded id, utility)                       | `src/core/types/`                  | `.type.ts`                   | `core/types/member-id.type.ts`                            | sometimes       | none                                                           |
| function (pure, one per file)                    | `src/core/functions/`              | `.function.ts`               | `core/functions/member-id.function.ts`                    | sometimes       | none; a function with logic gets a test beside it              |
| constant                                         | `src/core/constants/`              | `.constant.ts`               | `core/constants/max-points-per-entry.constant.ts`         | sometimes       | none                                                           |
| module service                                   | `src/<entry>/services/`            | `.service.ts`                | `core/services/loyalty.service.ts`                        | yes             | `./services/__tests__/loyalty.service.test.ts`                 |
| service with `@Named` instance                   | `src/node/services/`               | `.service.ts`                | `node/services/ledger-reconciler.service.ts`              | catalogue       | none; the module test proves the binding                       |
| driver (`@Driver(Port, name)`)                   | `src/<entry>/drivers/`             | `.driver.ts`                 | `core/drivers/memory-…`, `node/drivers/postgres-…`        | yes             | `drivers/__tests__/postgres-loyalty-ledger.driver.int.test.ts` |
| module (`@Module({ key, exports })`)             | `src/node/`                        | `.module.ts`                 | `node/loyalty-kit.module.ts`                              | yes             | `node/__tests__/loyalty-kit.module.test.ts`                    |
| model (`@Model`, `Model.with(traits)`, `@Index`) | `src/node/models/`                 | `.model.ts`                  | `node/models/loyalty-account.model.ts`                    | yes             | none; a factory in `./testing` is written instead              |
| migration (blueprint class, diff output)         | `src/node/migrations/`             | `.migration.ts`              | `node/migrations/0001-create-loyalty-tables.migration.ts` | yes             | none; the `.int` tier applies the compiled SQL                 |
| seeder (`Seeder` subclass, `static ids`)         | `src/testing/seeds/`               | `.seed.ts`                   | `testing/seeds/demo.seed.ts`                              | sometimes       | none; used by `.seed(DemoSeeder)`                              |
| factory (`Factory<Model>`)                       | `src/testing/factories/`           | `.factory.ts`                | `testing/factories/loyalty-account.factory.ts`            | yes             | none                                                           |
| factory (value, `factory<DTO>()`)                | `src/testing/factories/`           | `.factory.ts`                | `testing/factories/points-entry.factory.ts`               | sometimes       | none                                                           |
| fake (`Fake.of(Port)`)                           | `src/testing/fakes/`               | `.fake.ts`                   | `testing/fakes/fake-loyalty-members.fake.ts`              | yes             | none                                                           |
| matcher (`createMatcher`)                        | `src/testing/matchers/`            | `.matcher.ts`                | `testing/matchers/to-have-balance.matcher.ts`             | sometimes       | `matchers/__tests__/to-have-balance.matcher.test.ts`           |
| permissions (`@Permissions(Model)`)              | `src/node/permissions/`            | `.permission.ts`             | `node/permissions/loyalty-account.permission.ts`          | yes             | none; the contract test                                        |
| policy (`@Policy(Model)`, `PolicyFor`)           | `src/node/policies/`               | `.policy.ts`                 | `node/policies/loyalty-account.policy.ts`                 | sometimes       | `policies/__tests__/loyalty-account.policy.test.ts`            |
| event (`@Event`, `@Version(2, { alsoPublish })`) | `src/node/events/`                 | `.event.ts`                  | `node/events/points-earned.event.ts`                      | yes             | none; the contract test                                        |
| event upcast (`@Upcast`)                         | `src/node/versions/`               | `.upcast.ts`                 | `node/versions/points-earned-v1.upcast.ts`                | catalogue       | none; the contract test keeps it until its sunset              |
| hook point (`@HookPoint`)                        | `src/node/hooks/`                  | `.hook-point.ts`             | `node/hooks/loyalty.hook-point.ts`                        | sometimes       | none; the contract test                                        |
| hook implementer (`@Hook`)                       | `src/node/hooks/`                  | `.hook.ts`                   | `node/hooks/tier-multiplier.hook.ts`                      | sometimes       | `hooks/__tests__/tier-multiplier.hook.test.ts`                 |
| action (call)                                    | `src/node/actions/`                | `.action.ts`                 | `node/actions/enroll-member.action.ts`                    | yes             | `actions/__tests__/enroll-member.action.test.ts`               |
| action + `runs:` workflow                        | `src/node/actions/` + `workflows/` | `.action.ts`, `.workflow.ts` | `redeem-points.action.ts`, `redeem-points.workflow.ts`    | sometimes       | `workflows/__tests__/redeem-points.workflow.int.test.ts`       |
| workflow signal (`@Signal`, `waitFor`)           | `src/node/workflows/`              | `.signal.ts`                 | `redemption-confirmed.signal.ts`, sent by `confirm-redemption.action.ts` | sometimes | `workflows/__tests__/redeem-points.workflow.int.test.ts` |
| job (`@AsJob` + `@Cron`)                         | `src/node/actions/`                | `.action.ts`                 | `node/actions/expire-points.action.ts`                    | sometimes       | an action test                                                 |
| query (+ `cache:`)                               | `src/node/queries/`                | `.query.ts`                  | `node/queries/get-balance.query.ts`                       | yes             | `queries/__tests__/get-balance.query.test.ts`                  |
| listener (`@OnEvent(Class)`)                     | `src/node/listeners/`              | `.listener.ts`               | `node/listeners/recalculate-tier.listener.ts`             | sometimes       | `listeners/__tests__/recalculate-tier.listener.test.ts`        |
| settings (`@Settings`, `@Setting`)               | `src/node/settings/`               | `.setting.ts`                | `node/settings/loyalty.setting.ts`                        | sometimes       | none; faked with `fakeSettings`                                |
| resource (`@Resource`, builders)                 | `src/node/resources/`              | `.resource.ts`               | `node/resources/loyalty-account.resource.ts`              | sometimes       | none; the contract test and the console e2e tier               |
| widget (`@Widget`)                               | `src/node/widgets/`                | `.widget.ts`                 | `node/widgets/points-issued.widget.ts`                    | sometimes       | none                                                           |
| document (`@Document`, L2)                       | `src/node/documents/`              | `.document.ts`               | `node/documents/loyalty-overview.document.ts`             | catalogue       | none                                                           |
| override point (`@OverridePoint`)                | `src/core/override-points/`        | `.point.ts`                  | `core/override-points/points-balance.point.ts`            | catalogue       | none; gen fails if nothing registers it                        |
| override (`@Override`, component)                | `src/react/overrides/`             | `.override.tsx`              | `react/overrides/points-balance.override.tsx`             | catalogue       | none                                                           |
| component (+ React hook)                         | `src/react/<name>/`                | `.tsx`, `use-*.ts`           | `react/points-balance/`                                   | sometimes       | `react/points-balance/__tests__/points-balance.test.tsx`       |
| barrel                                           | each entry                         | `index.ts`                   | `src/index.ts`                                            | yes             | none                                                           |
| manifest                                         | `.stackra/`                        | `app-manifest.json`          | committed, written by gen                                 | yes             | `src/__tests__/app-manifest.contract.test.ts`                  |

Not shown here (a service shows them): `states/`, `links/`, `guards/`, `repositories/`, `mails/`,
`ai/`, `search/`, dated `@Change` classes. Decorators and an Explorer are in
`packages/security/access-log`.

## Rules this package demonstrates

- **A port is an abstract class and its own token**: no `defineToken`, no same-named pair, no
  `@Inject`, no `@Injectable`. Drivers `extends` the port and register with
  `@Driver(Port, "name")`; `@DriverOf(Port)` on the config field picks one by name, typed by
  `DriverName<Port>` so a typo is a type error; a host replaces the class with `@Replaces(Port)`. A
  port with exactly one registered driver (`LoyaltyMembers`, the host's) needs no field. The module
  is `@Module({ key, exports })` and nothing else: no `forRoot`, no `ConfigurableModuleBuilder`.
- **No magic strings**: a string appears only at a declaration site (`@Action({ key })`,
  `@Event({ name })`, `Enum.case("gold")`, `@Driver(…, "memory")`) or as a checked literal. Closed
  sets of house values are class enums: `Risk.L1`, `ActorKind.User`, `HttpMethod.Put`,
  `UxAfter.Refresh`, `ErrorCategory.Conflict`, `SettingScope.Tenant`. References are classes or
  generated constants: `I18n.loyalty_kit.tiers.gold`, `LoyaltyAccounts.columns.memberId`,
  `LoyaltyAccountPermissions.redeem`, `invalidateOn: [PointsEarned]`, `compensate: "credit"` typed
  `keyof` the workflow.
- **Risk lives on the permission** and "who may run" in `actors`: an action has no `risk` option and
  no `system` flag.
- **One earn path**: a host calls
  `AccountService.earn(memberId(…), { amountMinor, currency, reference })`, which enrolls on the
  first earn, runs the `earnAdjust` chain (the tier multiplier), appends to the ledger and records
  `points.earned`; `RecalculateTierListener` then promotes. `LoyaltyService.quoteEarn` is the pure
  maths and writes nothing.
- **No version in a key**: `points.earned` is `.v2` on the wire through `@Version(2)`; the outbox
  publishes the current version only, `alsoPublish: [1]` keeps `.v1` until `sunset`, and one
  `@Upcast` class converts stored v1 rows on read. Actions carry no `@n`.
- **Realms, not panels**: a package never names an app's panel. Resources, widgets, settings pages
  and documents target realms (`realms: [Realm.TenantAdmin]`, `Realm` from `@stackra/contracts`;
  cases `TenantAdmin`, `Customer`, `Platform`), and each app `@Panel({ key, realms })` says which
  realms it hosts; gen places the contribution in every panel hosting its realm. The manifest
  records realm codes (`tenant_admin`, `customer`).
- **Wire names**: action keys name the aggregate verb (`loyalty_kit.account.enroll`,
  `loyalty_kit.points.redeem`); permission names follow `<module>.<snake class>.<member>` from the
  `@Permissions(LoyaltyAccount)` class (`loyalty_kit.loyalty_account.redeem`). An action key
  carries no version field until `@Version` says otherwise.
- **Migrations by entry and class**: the manifest lists
  `{ "from": "@acme/loyalty-kit/node", "class": "CreateLoyaltyTables" }`, never a `src/` path,
  so a host merges what the published package exports.
- **Named instances**: `@DriverOf(LoyaltyLedger, { named: { primary, archive } }) ledgers` in config
  and `@Named("primary")` on the constructor parameter (LedgerReconcilerService); `@Named` is the
  only injection decorator.
- **The aggregate records, the unit of work ships**: `account.record(new PointsEarned(...))` and
  `ctx.record(...)` in a step; no injectable event bus.
- **The model is the one source of the schema**: columns and every index are on the models;
  `stackra db diff` writes the migrations, which are immutable once committed.
- **Memory first** (ADR 0266): the memory driver ships in `.` and the fake in `./testing`; the
  `.int` test proves the postgres driver, built on `@stackra/ledger`'s journal, keeps the same
  contract.
- **Redemption waits, it never sleeps**: the redeem run parks before its `confirm` step
  (`waitFor: RedemptionConfirmed`, correlated on member and reference, 15 minutes) until the host
  calls `loyalty_kit.points.confirm_redemption`; without it, the engine credits the debit back. No
  step body waits, so the same graph runs on any workflow engine (ADR 0152 decision 1).
- **Hooks** (ADR 0265): `hooks/` holds extension hooks only; the React hook `usePointsBalance` sits
  beside its component.
- **Tests** (ADR 0007 amended): every test file carries the contract header; `describe` takes the
  class; each `it` has a one-line intent docblock. Helpers come from the owning package's
  `./testing` (ADR 0269).
- **Publishing**: `publishConfig` (with `exports` pointing at `dist`) plus a changeset; a package
  has no `runway.yaml`. The module root is `package.json#stackra.module`; a package has no
  `stackra.config.ts`.

## Use

```ts
// services/commerce/src/commerce.module.ts
@Module({ imports: [LoyaltyKitModule] })

// services/commerce/src/config/loyalty-kit.config.ts: only what differs from the package
export default override(LoyaltyKitConfig, { maxRedeemPercent: 30 });

// anywhere in the host
constructor(private readonly accounts: AccountService) {}   // no @Inject: a class is its own token
await this.accounts.earn(memberId(event.data.customerId), { amountMinor, currency, reference });

// the host's one obligation: the only candidate for the port, so no config field selects it
@Driver(LoyaltyMembers, "commerce") export class CommerceLoyaltyMembers extends LoyaltyMembers { … }
```
