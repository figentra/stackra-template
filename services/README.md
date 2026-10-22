# services

One folder per deployable service (`@acme/service-<name>`, `tier:service`). A service hosts modules and owns no
behaviour itself (ADR 0111, 0259). Services never import each other: they inject each other's generated clients and
listen to each other's public events (ADR 0260), both generated from the producer's committed
`.stackra/app-manifest.json`.

Every service is written to the decorator authoring model (ADR 0094): everything with identity is a class with a kind decorator, nothing
is referenced by string (generated constants from `#stackra/*` and the class enums of the owning packages: `Risk`,
`ActorKind`, `HttpMethod`, `ApiArea`, `ErrorCategory`, `UxAfter`, `SettingScope`, `SystemRole`), drivers register
themselves (`@Driver`) and one config field picks them (`@DriverOf`), and each member carries its own
`stackra.config.ts` (what it is) and `runway.yaml` (how and where it runs).

| Service         | Shows                                                                                                                                                                                                                        |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `commerce`      | the reference: four modules, every file kind of a service once (see `src/modules/orders/README.md`), two package modules hosted, search, media upload, money, entitlements, outbound webhooks                                |
| `notifications` | the consumer: commerce reached by event, call and `.queue()` command; delivery as a retried job with a dead letter; the in-app inbox; notification preferences; a `@Webhook` receiver; the Resend integration and connection |

Member layout (both services):

```
services/<name>/
├── package.json · stackra.config.ts · runway.yaml · turbo.jsonc · tsconfig.json · vitest.config.ts · README.md · .gitignore
├── .stackra/{app-manifest.json, openapi.json}   # committed; gen/ and migrations/ and encore/ are generated
└── src/{main.ts, <name>.module.ts, config/, contracts/, __tests__/, modules/<key>/<kind>/}
```
