# services

One folder per deployable service (`@acme/service-<name>`, `tier:service`). A service hosts modules
and owns no behaviour itself (ADR 0111, 0259). Services never import each other: they inject each
other's generated clients and listen to each other's public events (ADR 0260), both generated from
the producer's committed `stackra.manifest.json`.

Every service follows the programming model v3.1 (ADR 0294 as amended, see the root `AGENTS.md`): a
class states its kind once, in its base class, with its partner as a type argument
(`extends Action({ key })`, `extends CrudService<Order>`), and every file exports one declaration;
the path says the kind (`src/modules/<key>/<group>/<name>.<kind>.ts`); identities such as permission
names, event names and endpoints are derived from names and locked in the manifest; nothing is
referenced by string (generated constants from `#stackra/*` and the `Enum.of` values of the owning
packages: `ActorKind`, `HttpMethod`, `ApiArea`, `SettingScope`, `SystemRole`). A driver is named by
its file prefix, and one config field typed `DriverName<Port>` picks it. Each member carries its own
`stackra.config.ts` (what it is, `defineService`) and `runway.yaml` (what it needs, per environment,
ADR 0296); where it runs and how it is packed is the root runway's topology.

| Service         | Shows                                                                                                                                                                                                                                        |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `commerce`      | the feature service: four modules, every group of a service module once (see `src/modules/orders/README.md`), two package modules hosted, search, media upload, money, entitlements, outbound webhooks                                       |
| `notifications` | the consumer: commerce reached by event, call and queued call; delivery as a retried job with a dead letter; the in-app inbox; notification preferences; an inbound `WebhookEvent<ResendIntegration>`; the Resend integration and connection |

Member layout (both services):

```text
services/<name>/
├── package.json · stackra.config.ts · runway.yaml · turbo.jsonc · tsconfig.json · README.md · AGENTS.md · .gitignore
├── stackra.manifest.json · openapi.json        # the committed contract and its projection
├── .stackra/                                   # generated, gitignored: entry/server.ts, gen/, migrations/, encore/
└── src/{config/, schemas/, __tests__/, modules/<key>/<group>/}   no root module file: gen derives it
```

Nobody writes `main.ts` or a root module that only lists what gen can derive: gen writes
`.stackra/entry/server.ts`, which calls `createApp(<Name>Module, { wiring })` from
`@stackra/app/server` with the module it derives from the folder and the `package.json` dependencies
that ship one (ADR 0295 decision 7, as amended by v3.1).
