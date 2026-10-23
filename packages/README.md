# packages

`packages/<category>/<name>`, one category per member, never a package directly under `packages/`
(workspace-layout rule). Categories: application, commerce, communication, cross-cutting, data,
developer, experience, foundation, infrastructure, runtime, security, state. In a framework project
these are `@stackra/*` public packages (home A, no product rules); in a product repository,
`@acme/*` private packages hold logic two services share (home B, ADR 0259) and use the same
categories. This repository is a product repository, so its three packages are `@acme/*` with
`"private": true`. A package's module contributes exactly like a service's.

All three follow the v3 programming model (ADR 0294): every class states its kind once, in its base
class (`extends Driver(LoyaltyLedger)`, `extends Module({ exports })`); the path says the kind;
ports are abstract classes extending `Port` and are their own token; a driver is named by its file
prefix and picked by a config field typed `DriverName<Port>`; closed sets are `Enum.of` values. A
package authors `stackra.config.ts` (`definePackage({})`) and one root module,
`src/node/<key>.module.ts`; gen writes the entry barrels into `.stackra/entry/`, and `package.json`
`exports` point at them. A package keeps `publishConfig` (with `exports` pointing at `dist`) so it
publishes through changesets the day it flips `"private": false`, and has no `runway.yaml`.

| Package                | Shows                                                                                                                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `commerce/loyalty-kit` | the **shapes catalogue**: every kind a package can hold, one per file, each with its test; two ports with self-named drivers (postgres on `@stackra/ledger`), a workflow with a signal, an event change, `./react` and `./testing` entries |
| `security/access-log`  | a **decorator package**: the `AccessLogged` class facet made with `createDecorator`, its Explorer, the conformance test against gen, the retention job and the audit-trail resource, a `./testing` entry                                   |
| `cross-cutting/brand`  | where brand lives: token names as contract types, values as constants, `css/tokens.css` + `css/native.css` generated from them with `--brand-<group>-<name>` names, `brandCssVariables`, the mark                                          |

Layout per package (ADR 0294 decision 15): `src/contracts/` (the leaf: `ports/`, `enums/`, `types/`;
it imports nothing else from the package), `src/config/<pkg>.config.ts` (the config class),
`src/core/` (isomorphic code: services, drivers, errors, functions, schemas), `src/node/` (the root
module and the module groups a service module has, `database/` included), `src/react/<name>/`
(renderers), `src/testing/` (fakes, matchers and the factories and demo seeder tests use, ADR 0269;
no runtime entry imports it, so Faker never reaches a server), `assets/lang/<locale>/<ns>.json`, and
the committed `stackra.manifest.json` at the member root. Dependencies run one way: core imports
contracts; node, react and native import core; testing imports them all. No symbol is exported from
two entries. Shared pure helpers go to `@stackra/support` (foundation); there is no `utils/` folder
anywhere.
