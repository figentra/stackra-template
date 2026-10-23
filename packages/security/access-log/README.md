# @acme/access-log

A decorator package (ADR 0117 C2, ADR 0144) at `packages/security/access-log` (`tier:lib`, category
`security`): the class facet `@AccessLogged({ classification, subjects })` writes one record per
call of a marked class to an `AccessLogSink`. The package shows the parts every decorator package
has, in the programming model of ADR 0294: the facet made with `createDecorator`, the Explorer that
applies it at bootstrap, the sink port and its drivers, the retention job, the audit-trail resource,
and the conformance test that keeps the Explorer and gen in agreement.

## Use

```ts
// a host's root module imports the package module once
export class CommerceModule extends Module({ imports: [AccessLogModule] }) {}

// an action: each `handle` call is logged against the principal the call is for
@AccessLogged({ classification: DataClassification.Pseudonymous })
export class CancelOrderAction extends Action({ key: "order.cancel" }) { … }

// a service: each call is logged against the `customerId` of the records it handles
@AccessLogged({ classification: DataClassification.Pseudonymous, subjects: "customerId" })
export class OrderService extends CrudService<Order> { … }

// a host's config override: same name, package class aliased
import { AccessLogConfig as BaseAccessLogConfig } from "@acme/access-log";
export class AccessLogConfig extends BaseAccessLogConfig { override retentionDays = 730; }

// a host table that stores a classification: the package's macro writes the same column
schema.create("data_exports", (t: Blueprint) => { t.dataClassification("classification"); });

// a host's own sink replaces the drivers
@Replaces(AccessLogSink)
export class SiemAccessLogSinkDriver extends Driver(AccessLogSink) { … }
```

The facet wraps the methods the class itself declares (`handle` on an action; every declared method
on a service), never inherited ones. A call that touched no subject writes no record. A sink failure
is logged as `access_log_write_failed` and never fails the call.

## Entries

| Entry         | Holds                                                                                                                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.`           | `AccessLogged`, `AccessLogService`, `AccessLogConfig` and its shape `AccessLogOptions` with `AccessLogOptions$`, `MemoryAccessLogSinkDriver`, `ACCESS_LOG_WRITE_FAILED`                                  |
| `./contracts` | the `AccessLogSink` port, `DataClassification` and its schema, `AccessRecord`, `AccessLoggedOptions`                                                                                                     |
| `./node`      | `AccessLogModule`, `AccessLogExplorer`, `PostgresAccessLogSinkDriver`, `AccessLogEntry`, the permissions, `PurgeAccessLogAction` and its schemas, `DataClassificationMacro`, the migration, the resource |
| `./testing`   | `AccessLogSinkFake.with({ failing })`, `AccessLogEntryFactory`, `toHaveLoggedAccess` and its `ToHaveLoggedAccessOptions`                                                                                 |
| `./assets/*`  | `access_log::` translations (`assets/lang/<locale>/access_log.json`)                                                                                                                                     |

No symbol is exported from two entries. Nobody writes an entry barrel: gen writes
`.stackra/entry/{index,contracts,node,testing}.ts`, and `package.json` `exports` point at them. The
tsdown and Vitest configs are generated into `.stackra/` with gitignored root shims.
`stackra.manifest.json` at the member root is the committed contract; `.stackra/gen/*` is committed
in the template only so it can be read, and is imported as `#stackra/<name>`.

## Layout

| Path                                                                                           | Holds                                                                                        | Test                                                     |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `src/contracts/ports/access-log-sink.port.ts`                                                  | `AccessLogSink extends Port`, the interface the drivers implement (`ports/README.md`)        | through the drivers and the conformance test             |
| `src/contracts/enums/data-classification.enum.ts`                                              | `DataClassification`, an `Enum.of`                                                           | none                                                     |
| `src/contracts/types/*.type.ts`                                                                | `AccessRecord`, `AccessLoggedOptions`                                                        | none                                                     |
| `src/config/access-log.config.ts`, `src/core/schemas/access-log-options.schema.ts`             | `AccessLogConfig extends Config({ schema: AccessLogOptions, env })`: `sink`, `retentionDays` | the purge test sets both                                 |
| `src/core/decorators/access-logged.decorator.ts`                                               | the class facet, made with `createDecorator`                                                 | `node/__tests__/access-log.explorer.test.ts`             |
| `src/core/services/access-log.service.ts`                                                      | `AccessLogService extends Service`: resolves subjects, writes, swallows failures             | `core/services/__tests__/access-log.service.test.ts`     |
| `src/core/drivers/memory-access-log-sink.driver.ts`                                            | `MemoryAccessLogSinkDriver extends Driver(AccessLogSink)`                                    | the conformance test                                     |
| `src/node/access-log.module.ts`                                                                | `AccessLogModule extends Module({ exports })`                                                | the conformance test imports it                          |
| `src/node/access-log.explorer.ts`                                                              | `AccessLogExplorer extends Explorer`                                                         | `node/__tests__/access-log.explorer.test.ts`             |
| `src/node/access/access-log-entry.permissions.ts`                                              | `read` (L1) and `purge` (L2, system)                                                         | none; the manifest locks the names                       |
| `src/node/actions/purge-access-log.action.ts`, `src/node/schemas/purge-access-log-*.schema.ts` | the retention job (`job:` with a cron) and its input and output                              | `node/actions/__tests__/purge-access-log.action.test.ts` |
| `src/node/drivers/postgres-access-log-sink.driver.ts`                                          | `PostgresAccessLogSinkDriver`                                                                | the host's `.int` tier                                   |
| `src/node/models/access-log-entry.model.ts`                                                    | `AccessLogEntry`, append-only by trait, `@Searchable` on `target`                            | none                                                     |
| `src/node/resources/access-log-entry/access-log-entry.resource.ts`                             | the read-only audit trail in the admin area                                                  | the console e2e tier                                     |
| `src/node/database/migrations/0001-create-access-log-entries.migration.ts`                     | the table in the `access_log` Postgres schema and its no-UPDATE trigger (a snapshot)         | the `.int` tier applies it                               |
| `src/node/database/macros/data-classification.macro.ts`                                        | `t.dataClassification(column)`, the column of a DataClassification field                     | gen checks it against the field's columns                |
| `src/node/database/factories/access-log-entry.factory.ts`                                      | `AccessLogEntryFactory`, exported from `./testing` only                                      | none                                                     |
| `src/testing/access-log-sink.fake.ts`, `src/testing/to-have-logged-access.matcher.ts`          | `AccessLogSinkFake`, `toHaveLoggedAccess` (its options type in its own file)                 | through the service and conformance tests                |

## Rules this package demonstrates

- **`createDecorator`**: the facet is registered with the kinds it may mark (actions, queries and
  services), and the decorator is its own metadata key (`discovery.classesWith(AccessLogged)`,
  `discoverWithGen(Module, AccessLogged)`). Its options are literals, so gen reads them statically.
- **Drivers named by file**: `memory-access-log-sink.driver.ts` is `memory`, the postgres one
  `postgres`; config `sink` picks one, typed by `DriverName<AccessLogSink>`; a host's SIEM forwarder
  is `@Replaces(AccessLogSink)`. The module lists only its export.
- **Conformance** (ADR 0144): what the Explorer wraps at bootstrap equals what gen discovers at
  build time; one test.
- **Retention is real**: `AccessLogConfig.retentionDays` is honoured by `PurgeAccessLogAction`, a
  job run as the system actor, and the trail is readable through `AccessLogEntryResource`.
- **No magic strings**: `classification: DataClassification.Personal`, never `"personal"`; the log
  event is the constant `ACCESS_LOG_WRITE_FAILED`.
- **A package-owned column convention is a macro**: `DataClassificationMacro` (in
  `database/macros/`) gives every importing host `t.dataClassification(column)`, named after the
  field type it writes, with the codes as literals so released SQL never changes.
- **Migrations are snapshots**: 0001 imports only `@stackra/database`, names everything with
  literals, uses partner macros, and adds its one raw SQL guard (no UPDATE on the trail) through
  `schema.sql(statement, { inverse })`; there is no `down()`.
