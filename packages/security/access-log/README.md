# @stackra/access-log

A decorator package (ADR 0117 C2, ADR 0144) at `packages/security/access-log` (`tier:lib`, category
`security`): `@AccessLogged({ classification, subjects })` on a method writes one record per call to
an `AccessLogSink`. The package shows the three parts every decorator package has, the
self-registering drivers, the retention job and the screen that reads the audit trail, and the test
that keeps the decorator and gen honest.

| Entry         | Holds                                                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `.`           | `AccessLogged`, `DataClassification`, `AccessLogService`, `AccessLogConfig`, `MemoryAccessLogSink`                         |
| `./contracts` | the `AccessLogSink` port, `AccessRecord`, `AccessLoggedOptions` and `AccessLoggedDecorator` (gen reads them), the enum     |
| `./node`      | `AccessLogModule`, `AccessLogExplorer`, `PostgresAccessLogSink`, `AccessLogEntry`, the permissions, `PurgeAccessLogAction` |
| `./testing`   | `MemoryAccessLogSink`, `FakeAccessLogSink.with({ failing })`, `AccessLogEntryFactory`, `toHaveLoggedAccess`                |

`.stackra/app-manifest.json` is the committed contract; `.stackra/gen/*` is committed in the template
only so it can be read, and is imported as `#stackra/<name>`.

## Shapes index

Kind → folder → file suffix → example → the test that proves it. A kind folder appears with its
second file for `enums/ decorators/ migrations/ constants/` (ADR 0130 d2); the catalogue shows the
folder with one. Drivers always sit in `drivers/`, even when an entry has only one.

| Kind                                 | Folder                                   | Suffix           | Example                                                       | Test                                                             |
| ------------------------------------ | ---------------------------------------- | ---------------- | ------------------------------------------------------------- | ---------------------------------------------------------------- |
| decorator (`createDecorator`)        | `src/core/decorators/`                   | `.decorator.ts`  | `core/decorators/access-logged.decorator.ts`                  | `node/__tests__/access-log.explorer.test.ts` (conformance)       |
| decorator options and call signature | `src/core/interfaces/`                   | `.interface.ts`  | `core/interfaces/access-logged-options.interface.ts`          | none                                                             |
| enum (class)                         | `src/core/enums/`                        | `.enum.ts`       | `core/enums/data-classification.enum.ts`                      | none                                                             |
| constant                             | `src/core/constants/`                    | `.constant.ts`   | `core/constants/access-log-write-failed.constant.ts`          | none                                                             |
| port (abstract class = token)        | `src/contracts/`                         | `.port.ts`       | `contracts/access-log-sink.port.ts`                           | none; the conformance test resolves it                           |
| config (`@Config`, `@DriverOf`)      | `src/config/`                            | `.config.ts`     | `config/access-log.config.ts`                                 | none; the conformance test sets `sink`                           |
| driver (`@Driver(Port, name)`)       | `src/core/drivers/`, `src/node/drivers/` | `.driver.ts`     | `memory-access-log-sink.driver.ts`, `postgres-…`              | the conformance test (memory); the host's `.int` tier (postgres) |
| service                              | `src/core/services/`                     | `.service.ts`    | `core/services/access-log.service.ts`                         | the conformance test                                             |
| Explorer (`OnApplicationBootstrap`)  | `src/node/`                              | `.explorer.ts`   | `node/access-log.explorer.ts`                                 | `node/__tests__/access-log.explorer.test.ts`                     |
| module (`@Module({ key, exports })`) | `src/node/`                              | `.module.ts`     | `node/access-log.module.ts`                                   | the conformance test imports it                                  |
| model                                | `src/node/models/`                       | `.model.ts`      | `node/models/access-log-entry.model.ts`                       | none                                                             |
| migration (blueprint class)          | `src/node/migrations/`                   | `.migration.ts`  | `node/migrations/0001-create-access-log-entries.migration.ts` | none; the `.int` tier applies it                                 |
| permissions                          | `src/node/permissions/`                  | `.permission.ts` | `node/permissions/access-log-entry.permission.ts`             | none; the contract test                                          |
| job (`@AsJob` + `@Cron`)             | `src/node/actions/`                      | `.action.ts`     | `node/actions/purge-access-log.action.ts`                     | `node/actions/__tests__/purge-access-log.action.test.ts`         |
| schema                               | `src/node/schemas/`                      | `.schema.ts`     | `node/schemas/purge-access-log-output.schema.ts`              | through the action test                                          |
| resource (read-only)                 | `src/node/resources/`                    | `.resource.ts`   | `node/resources/access-log-entry.resource.ts`                 | none; the console e2e tier                                       |
| factory (`Factory<Model>`)           | `src/testing/factories/`                 | `.factory.ts`    | `testing/factories/access-log-entry.factory.ts`               | none                                                             |
| fake (`Fake.of(Port)`)               | `src/testing/fakes/`                     | `.fake.ts`       | `testing/fakes/fake-access-log-sink.fake.ts`                  | none                                                             |
| matcher (`createMatcher`)            | `src/testing/matchers/`                  | `.matcher.ts`    | `testing/matchers/to-have-logged-access.matcher.ts`           | the conformance test                                             |
| barrel                               | each entry                               | `index.ts`       | `src/index.ts`                                                | none                                                             |

## Rules this package demonstrates

- **`createDecorator`**: `createDecorator<Options>({ kind, target })` returns the decorator and
  registers its metadata key for the Explorer; the decorator is its own key
  (`discovery.methodsWith(AccessLogged)`, `discoverWithGen(Module, AccessLogged)`). No
  `defineMetadataKey`, no define family. Its public type is generic over the decorated method's
  arguments, so `subjects` is checked against the method it marks.
- **Self-registering drivers**: `@Driver(AccessLogSink, "memory" | "postgres")`,
  `@DriverOf(AccessLogSink) sink` on the config class (typed `DriverName<AccessLogSink>`),
  `@Replaces(AccessLogSink)` in a host for a SIEM forwarder. The module body is empty.
- **Conformance** (ADR 0144): what the Explorer wraps at bootstrap equals what gen discovers at
  build time; one test.
- **Retention is real**: `AccessLogConfig.retentionDays` is honoured by `PurgeAccessLogAction`, a
  `@Cron` job run as the `System` actor, and the trail is readable through `AccessLogEntryResource`.
- **No magic strings**: `classification: DataClassification.Personal`, never `"personal"`; the log
  event is the constant `ACCESS_LOG_WRITE_FAILED`.

## Use

```ts
// sink from src/config/access-log.config.ts
@Module({ imports: [AccessLogModule] })

@AccessLogged({ classification: DataClassification.Personal, subjects: (id: string) => [id] })
async view(id: string): Promise<CustomerView> { … }

// a host's own sink
@Replaces(AccessLogSink) export class SiemAccessLogSink extends AccessLogSink { … }
```
