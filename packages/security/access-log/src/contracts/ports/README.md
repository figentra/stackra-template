# ports

A **port** is an interface: an abstract class that lists methods and holds no code. The package's
code calls the port and never knows which class answers. A **driver** is a class that implements the
port (`extends Driver(AccessLogSink)`); the container hands the package whichever driver is
selected.

| Port            | The package…               | Implemented by                                                                   | Selected by                                         |
| --------------- | -------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------- |
| `AccessLogSink` | writes one record per call | `memory` (`src/core/drivers/`), `postgres` (`src/node/drivers/`), a host's class | config `sink`, or a host `@Replaces(AccessLogSink)` |

Rules:

- A port is its own DI token: a constructor parameter typed `AccessLogSink` receives the selected
  driver. No string token, no `@Inject`.
- A port file is a leaf: it imports only `src/contracts/`, so every entry may import it.
- A driver is named by its file prefix (`postgres-access-log-sink.driver.ts` is `postgres`), and the
  `DriverName<AccessLogSink>` config field lists exactly those names.
