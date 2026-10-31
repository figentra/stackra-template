<!--
Stackra file contract:
Purpose: what lives under services/ in a product repository started from the lean starter.
Boundary: placement and naming only; the grammar is the root AGENTS.md, placement in the topology is
          the root runway.yaml.
Runtime: none (documentation)
Governing contract: Stackra ADR 0111 and 0259 (services host modules), ADR 0260 (generated
                    clients), ADR 0296 (runway v3), ADR 0349 (decision 2: product package names),
                    stackra-15
-->

# services

One folder per deployable service (`@figentra/<product>-service-<name>`, `tier:service`). A service
hosts modules and owns no behaviour itself (ADR 0111, 0259). Services never import each other: they
inject each other's generated clients and listen to each other's public events (ADR 0260), both
generated from the producer's committed `stackra.manifest.json`.

| Service   | What it is                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------------- |
| `example` | `@figentra/acme-service-example`, written by `stackra new service example --area app`; rename or delete |

Create a service with `stackra new service <name> --area <public|app|admin|platform>`. It writes
package.json, `stackra.config.ts` (`defineService({ area })`), `runway.yaml` (what it needs, per
environment), tsconfig.json, turbo.jsonc, `assets/`, README.md, AGENTS.md and CHANGELOG.md, and
nothing under `src/`: feature modules go in `src/modules/<key>/<group>/<name>.<kind>.ts`. Nobody
writes `main.ts` or a root module that only lists what gen can derive: gen writes
`.stackra/entry/server.ts`. Every service is placed in a group of the root runway's production
topology (`environments.production.topology.groups`) before `stackra validate` passes; the example
sits in the `example` group. `pnpm validate` fails when the example drifts from what `stackra new`
writes (`.github/scripts/example-drift.mjs`).
