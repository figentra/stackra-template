<!--
Stackra file contract:
Purpose: what lives under packages/ in a product repository started from the lean starter.
Boundary: placement and naming only; the grammar is the root AGENTS.md.
Runtime: none (documentation)
Governing contract: Stackra ADR 0294 (decision 15: package layout), ADR 0259 (home B: product
                    packages), ADR 0349 (decision 2: product package names), stackra-15
-->

# packages

`packages/<category>/<name>`, one category per member, never a package directly under `packages/`
(workspace-layout rule). Categories: application, commerce, communication, cross-cutting, data,
design-system, developer, experience, foundation, infrastructure, runtime, security, state. In a
product repository a package is a private `@figentra/<product>-<name>` member that holds logic two
services share (home B, ADR 0259) and contributes a module exactly like a service. There is no
`packages/tooling`: the TypeScript, oxlint, Vitest, tsdown and commitlint presets are the core
`@stackra/*-config` packages, from `catalog:stackra`.

| Package               | What it is                                                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `application/example` | `@figentra/acme-example`, written by `stackra new package example --category application`; rename or delete |

Create a package with `stackra new package <name> --category <c>` (the category folder must exist).
It writes package.json, `stackra.config.ts` (`definePackage({})`), tsconfig.json, turbo.jsonc,
`assets/`, README.md, AGENTS.md, CHANGELOG.md and the workspace LICENSE, and nothing under `src/`.
Layout once code arrives (ADR 0294 decision 15): `src/contracts/` (ports, enums, types; the leaf),
`src/config/`, `src/core/` (isomorphic), `src/node/` (the module's groups), `src/react/<name>/` and
`src/native/<name>/` (renderers), `src/testing/` (fakes and matchers), `assets/lang/<locale>/`.
`pnpm validate` fails when the example drifts from what `stackra new` writes
(`.github/scripts/example-drift.mjs`).
