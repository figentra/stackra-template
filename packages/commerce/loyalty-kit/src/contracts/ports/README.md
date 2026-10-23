# ports

A **port** is an interface: an abstract class that lists methods and holds no code. The kit's code
calls the port; it never knows which class answers. A **driver** is a class that implements a port
(`extends Driver(LoyaltyLedger)`), and the container hands the kit whichever driver is selected.
Laravel calls the same idea a contract with its implementations; NestJS an injection token with a
provider.

| Port             | The kit…                | Implemented by                                                                          | Selected by                                           |
| ---------------- | ----------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `LoyaltyLedger`  | reads and writes points | `memory` (`src/core/drivers/`), `postgres` (`src/node/drivers/`), or a host's own class | config `ledger`, or a host `@Replaces(LoyaltyLedger)` |
| `LoyaltyMembers` | asks who may redeem     | the host only (commerce's `commerce-loyalty-members.driver.ts`)                         | nothing: one candidate needs no selector              |

Rules:

- A port is its own DI token: a constructor parameter typed `LoyaltyLedger` receives the selected
  driver. No string token, no `@Inject`.
- A port file is a leaf: it imports only `src/contracts/`, so every entry may import it.
- A driver is named by its file prefix (`postgres-loyalty-ledger.driver.ts` is `postgres`), and a
  `DriverName<LoyaltyLedger>` config field lists exactly those names.
- When a package needs data only a host has, it defines a port and the host implements it
  (`LoyaltyMembers`), so the package never imports the host.
