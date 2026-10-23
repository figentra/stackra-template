# @acme/loyalty-kit

A generic capability kit (ADR 0259 home A) at `packages/commerce/loyalty-kit` (`tier:lib`, category
`commerce`): points accounts, tiers, earning and redemption maths, no product business rule. It is
also the **shapes catalogue** for packages: every kind a package can hold appears here once, in the
programming model of ADR 0294 as amended by v3.1: **the path says the kind, the base class is the
kind, the types give the shape, and names give identity.**

A kit is a service module plus entry folders: `src/node/` holds the same group folders as a service
module (`services/commerce/src/modules/<key>/`), so a file moves between the two without relearning
placement. `src/contracts/` is the leaf, `src/core/` the isomorphic code, `src/react/` and
`src/native/` the renderers, `src/testing/` the test helpers.

## Use

```ts
// services/commerce/src/commerce.module.ts: a host imports the module by class
export class CommerceModule extends Module({ imports: [LoyaltyKitModule] }) {}

// services/commerce/src/config/loyalty-kit.config.ts: same name, package class aliased
import { LoyaltyKitConfig as BaseLoyaltyKitConfig } from "@acme/loyalty-kit";

export class LoyaltyKitConfig extends BaseLoyaltyKitConfig {
  override maxRedeemPercent = 30;
}

// anywhere in the host: a class is its own token
constructor(private readonly accounts: AccountService) { super(); }
await this.accounts.earn(memberId(event.customerId), { amountMinor, currency, reference });

// the host's one obligation: the members port's only driver, so no config field selects it
// services/commerce/src/modules/loyalty/drivers/commerce-loyalty-members.driver.ts
export class CommerceLoyaltyMembersDriver extends Driver(LoyaltyMembers) { … }

// a host extension of one slot: the slot is the indexed type argument, the method is `handle`
export class VerifyPointsBalanceExtension
  extends Extension<LoyaltyKitExtensionPoint["redeemVerify"]>({ order: 200 }) { … }
```

## Entries

| Entry         | Holds                                                                                                                                                                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.`           | `LoyaltyKitConfig` and its shape `LoyaltyKitOptions`, `LoyaltyService`, `MemoryLoyaltyLedgerDriver`, `memberId`, `isExpiringSoon`, the refusals, the views the renderers share, the constants (isomorphic)                                     |
| `./contracts` | the ports `LoyaltyLedger` (the kit drives it) and `LoyaltyMembers` (the host implements it), the enums `LoyaltyTier` and `EntryKind`, the types                                                                                                |
| `./node`      | `LoyaltyKitModule`, `LoyaltyKitSettings`, the access classes, actions, queries and their input and output schemas, events, the extension point and its extension, listener, models, resources, services, workflow, postgres driver, migrations |
| `./react`     | the web renderers `PointsBalance` and `PointsIssued` of the kit's two Custom widgets, with `PointsBalanceProps` and `PointsIssuedProps`; never imports `./node` or `./native`                                                                  |
| `./native`    | the native renderer `PointsBalance` with its `PointsBalanceProps` (same fields as the web Props); never imports `./node` or `./react`                                                                                                          |
| `./testing`   | `LoyaltyMembersFake.with()`, `LoyaltyAccountFactory`, `LedgerEntryFactory`, `pointsEntry`, `toHaveBalance`, `LoyaltyKitDemoSeeder` and its `ids`                                                                                               |
| `./assets/*`  | `loyalty_kit::` translations: `assets/lang/{en,ar}/loyalty_kit.json` and the `en-US` overlay, which holds only the keys that differ                                                                                                            |

No symbol is exported from two entries (the two `PointsBalance` classes are one contract implemented
per platform); factories and the demo seeder live in `src/node/database/` but only `./testing`
exports them, so Faker never reaches a server. Nobody writes an entry barrel: gen writes
`.stackra/entry/{index,contracts,node,react,native,testing}.ts`, and `package.json` `exports` point
at them. The tsdown and Vitest configs are generated into `.stackra/` with gitignored root shims.
`stackra.manifest.json` at the member root is the committed contract; `.stackra/gen/*` is committed
in the template only so it can be read, and is imported as `#stackra/<name>`.

## Shapes index

Every file exports exactly one declaration (an enum's `const` and its same-named `type` count as
one). A kind with options is called (`Action({ key })`, `Refusal({ kind })`); a kind without options
is written bare (`extends Schema`, `extends Signal`). The class a declaration is typed against is
its type argument; a value argument appears only where members are inherited (`Driver(Port)`).

| Kind                        | Path                                                                               | Base                                                                                  | Test                                                                |
| --------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| port                        | `contracts/ports/loyalty-ledger.port.ts` (see `contracts/ports/README.md`)         | `abstract class … extends Port`                                                       | the driver tests and the module test                                |
| enum                        | `contracts/enums/loyalty-tier.enum.ts`                                             | `Enum.of` and a same-named type                                                       | the extension test reads its meta                                   |
| type                        | `contracts/types/points-entry.type.ts`                                             | an interface in the leaf                                                              | none                                                                |
| config                      | `config/loyalty-kit.config.ts`, shape `core/schemas/loyalty-kit-options.schema.ts` | `Config({ schema, env })`; `DriverName<LoyaltyLedger>`                                | the module test sets `ledger`                                       |
| constant                    | `core/constants/max-points-per-entry.constant.ts`                                  | none                                                                                  | none                                                                |
| function                    | `core/functions/is-expiring-soon.function.ts`                                      | none (a function kind)                                                                | both renderer tests                                                 |
| error                       | `core/errors/insufficient-points.error.ts`                                         | `Refusal({ kind })`                                                                   | asserted with `toRefuseWith`                                        |
| schema                      | `node/schemas/redeem-points-input.schema.ts`, `-output.schema.ts`                  | `Schema`                                                                              | through the action and workflow tests                               |
| service                     | `core/services/loyalty.service.ts`, `node/services/account.service.ts`             | `Service`, `CrudService<LoyaltyAccount>`                                              | `core/services/__tests__/`, `node/services/__tests__/`              |
| driver                      | `core/drivers/memory-…`, `node/drivers/postgres-…`                                 | `Driver(LoyaltyLedger)`, named by file                                                | `node/drivers/__tests__/postgres-loyalty-ledger.driver.int.test.ts` |
| named instance              | `node/services/ledger-reconciler.service.ts`                                       | `Named<LoyaltyLedger, "primary">`                                                     | none                                                                |
| module                      | `node/loyalty-kit.module.ts` (written for its `exports`)                           | `Module({ exports })`                                                                 | `node/__tests__/loyalty-kit.module.test.ts`                         |
| settings, section           | `node/loyalty-kit.settings.ts`, `node/schemas/loyalty-tier-settings.schema.ts`     | `Settings({ scopes })`, `@Setting({ lockable, approval })`                            | faked with `fakeSettings`                                           |
| permissions, policy         | `node/access/loyalty-account.permissions.ts`, `.policy.ts`                         | `Permissions`, `Policy<LoyaltyAccount>`                                               | `node/access/__tests__/loyalty-account.policy.test.ts`              |
| model                       | `node/models/loyalty-account.model.ts`                                             | `Model.with(...traits)`, `@Searchable`                                                | through the factories                                               |
| action                      | `node/actions/enroll-member.action.ts`                                             | `Action({ key, endpoint, tool, intent })`                                             | `node/actions/__tests__/enroll-member.action.test.ts`               |
| job                         | `node/actions/expire-points.action.ts`                                             | `Action({ key, job })`                                                                | through `run`                                                       |
| query                       | `node/queries/get-balance.query.ts`                                                | `Query({ key, cache })`                                                               | `node/queries/__tests__/get-balance.query.test.ts`                  |
| event, version change       | `node/events/points-earned.event.ts`, `points-earned-v1.change.ts`                 | `IntegrationEvent`, `Change<PointsEarned>`                                            | the manifest contract test                                          |
| domain event                | `node/events/points-redeemed.event.ts`                                             | `DomainEvent`                                                                         | through the balance query test                                      |
| listener                    | `node/listeners/recalculate-tier.listener.ts`                                      | `Listener`                                                                            | `node/listeners/__tests__/recalculate-tier.listener.test.ts`        |
| extension point, extension  | `node/extensions/loyalty-kit.extension-point.ts`, `tier-multiplier.extension.ts`   | `ExtensionPoint`, `Extension<LoyaltyKitExtensionPoint["earnAdjust"]>`                 | `node/extensions/__tests__/tier-multiplier.extension.test.ts`       |
| workflow, signal            | `node/workflows/redeem-points.workflow.ts`, `redemption-confirmed.signal.ts`       | `Workflow<RedeemPointsInput>`, `Signal`                                               | `node/workflows/__tests__/redeem-points.workflow.int.test.ts`       |
| resource, widget, dashboard | `node/resources/loyalty-account/`                                                  | `Resource<LoyaltyAccount, LoyaltyAccountView>`, `Widget<GetBalanceQuery>`, `Document` | the console e2e tier                                                |
| migration                   | `node/database/migrations/0001-create-loyalty-tables.migration.ts`                 | `Migration` (a snapshot)                                                              | the `.int` tier applies it                                          |
| factory, seeder             | `node/database/factories/`, `node/database/seeders/demo.seeder.ts`                 | `Factory<LoyaltyAccount>`, `Seeder`                                                   | used by every seeded test                                           |
| renderer (web)              | `react/points-balance/points-balance.tsx`, Props in `points-balance.props.ts`      | `Component<PointsBalanceProps>` from `@stackra/ui`                                    | `react/points-balance/__tests__/points-balance.test.tsx`            |
| renderer (native)           | `native/points-balance/points-balance.tsx`, Props in `points-balance.props.ts`     | `Component<PointsBalanceProps>` from `@stackra/ui/native`                             | `native/points-balance/__tests__/points-balance.test.tsx`           |
| fake, matcher               | `testing/loyalty-members.fake.ts`, `testing/to-have-balance.matcher.ts`            | `Fake.of(Port)`, `createMatcher`                                                      | `testing/__tests__/to-have-balance.matcher.test.ts`                 |
| fixture                     | `testing/points-entry.fixture.ts`                                                  | `factory<DTO>()` (not a `.factory.ts`)                                                | none                                                                |

A service shows the kinds a package does not: `ai/`, `raw/`, notifications and dated response
changes. The `@AccessLogged` facet, an Explorer and a package-owned migration macro are in
`packages/security/access-log`.

## Rules this package demonstrates

- **A port is an interface the kit codes against**: an abstract class, its own token, no `@Inject`,
  no string token. Drivers extend `Driver(Port)` (the call returns a class, so no `define` prefix)
  and are named by their file prefix; a `DriverName<Port>` config field picks one, so a typo is a
  type error; a host replaces the class with `@Replaces(Port)`. A port with one candidate
  (`LoyaltyMembers`, the host's) needs no field.
- **Names give identity**: the action keys (`account.enroll`, `points.redeem`) are written once;
  permissions, tables, i18n keys, the signal key and the settings group are derived from names and
  locked in `stackra.manifest.json`. The kit's action keys name other aggregates than the model, so
  each action names its permission.
- **Surfaces are typed options**: `endpoint`, `tool`, `job` and `intent`, each with a default from
  the key and the actors; intent phrases live in the lang files
  (`loyalty_kit::actions.<name>.intents`), so Arabic has its own.
- **Risk lives on the permission** and "who may run" in `actors`; `expire` is a system permission no
  role may grant, and the L2 `freeze` makes the panel confirm and an agent ask for approval.
- **One earn path**: a host calls
  `AccountService.earn(memberId(…), { amountMinor, currency, reference })`, which enrolls on the
  first earn, runs the `earnAdjust` slot (an `after` slot: the tier multiplier), appends to the
  ledger and records `points.earned`; RecalculateTierListener then promotes, and never demotes.
  `LoyaltyService.quoteEarn` is the pure maths and writes nothing.
- **Extension point versus extension**: the point is the seam the kit publishes; an extension is one
  class per slot in any module. `after` adjusts a value, `before` may refuse or replace the
  arguments; Magento's `around` is an `Interceptor` on a whole action call.
- **Versioned events, unversioned keys**: `points.earned` is `.v2` through `version: 2`; the change
  file beside it converts both ways, so v1 is published until its sunset. Domain events are never
  versioned. Every event base comes from `@stackra/events`.
- **Caching**: a read is cached by its query's `cache: { ttl, invalidateOn }`, and the widget's
  refresh is derived from it; a value in a service is cached through the injected `Cache` port.
- **Areas, not panels**: the resource is in the admin area, the "My points" dashboard in the app
  area; a package never names an app's panel.
- **The model is the one source of the schema**: columns, indexes and the `@Searchable` facet are on
  the models, each module's tables live in its own Postgres schema (`loyalty_kit`), and
  `stackra db diff` writes the migrations: frozen snapshots with literal names and partner macros,
  no `down()`.
- **Memory first** (ADR 0266): the memory driver ships in `.` and the fake in `./testing`; the
  `.int` test proves the postgres driver, built on `@stackra/ledger`'s journal, keeps the same
  contract.
- **Redemption waits, it never sleeps**: the redeem run parks before its `confirm` step
  (`waitFor: RedemptionConfirmed`, correlated on member and reference, 15 minutes) until the host
  calls `loyalty_kit.points.confirm_redemption`; without it, the engine undoes the debit. No step
  body waits, so the same graph runs on any workflow engine (ADR 0152 decision 1).
- **Class components on both platforms**: each renderer is a class whose fields are state, whose
  `use*` fields are hooks and whose `render()` is the body; gen compiles it to a function component.
  Props sit in their own `.props.ts` file; an app shadows a renderer under
  `src/overrides/@acme/loyalty-kit/`.
- **Publishing**: `publishConfig` (with `exports` pointing at `dist`) plus a changeset; a package
  has no `runway.yaml`. `stackra.config.ts` is `definePackage({})`: the key and the entries are
  derived.
