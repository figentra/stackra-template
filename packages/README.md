# packages

`packages/<category>/<name>`, one category per member, never a package directly under `packages/`
(workspace-layout rule). Categories: application, commerce, communication, cross-cutting, data,
design-system, developer, experience, foundation, infrastructure, runtime, security, state. In a
framework project these are `@stackra/*` public packages (home A, no product rules); in a product
repository, `@acme/*` private packages hold logic two services share (home B, ADR 0259) and use the
same categories. This repository is a product repository, so its three packages are `@acme/*` with
`"private": true`. A package's module contributes exactly like a service's.

All three follow the programming model of ADR 0294 as amended by v3.1: every class states its kind
once, in its base class; a kind with options is called (`Action({ key })`, `Refusal({ kind })`) and
a kind without is written bare (`extends Schema`); the class a declaration is typed against is its
type argument (`Policy<LoyaltyAccount>`, `Resource<LoyaltyAccount, LoyaltyAccountView>`,
`Widget<GetBalanceQuery>`, `Extension<LoyaltyKitExtensionPoint["earnAdjust"]>`), and a value
argument appears only where members are inherited (`Driver(LoyaltyLedger)`). Every file exports
exactly one declaration. Ports are interfaces (abstract classes extending `Port`) and are their own
token; a driver is named by its file prefix and picked by a config field typed `DriverName<Port>`;
configuration is `Config({ schema, env })`; closed sets are `Enum.of` values; renderers are class
components. A package authors `stackra.config.ts` (`definePackage({})`) and a root module only when
it says something gen cannot derive (`src/node/<key>.module.ts` with `exports`); gen writes the
entry barrels into `.stackra/entry/`, and `package.json` `exports` point at them. A package keeps
`publishConfig` (with `exports` pointing at `dist`) so it publishes through changesets the day it
flips `"private": false`, and has no `runway.yaml`.

| Package                | Shows                                                                                                                                                                                                                                                                                                    |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `commerce/loyalty-kit` | the **shapes catalogue**: every kind a package can hold, one per file, each with its test; two ports with self-named drivers (postgres on `@stackra/ledger`), a workflow with a signal, an event change, settings with a section, snapshot migrations, and `./react`, `./native` and `./testing` entries |
| `security/access-log`  | a **decorator package**: the `AccessLogged` class facet made with `createDecorator`, its Explorer, the conformance test against gen, the retention job, the audit-trail resource, a package-owned migration macro (`t.dataClassification`), a `./testing` entry                                          |
| `design-system/theme`  | the product's brand as a **Stackra Design System theme** (Stackra ADR 0302): `ACME_THEME` built with `defineTheme` on the stackra theme, the committed `themes/acme/{web,native}.css` a test holds equal to the renderers' output, the Acme mark                                                         |

Layout per package (ADR 0294 decision 15): `src/contracts/` (the leaf: `ports/`, `enums/`, `types/`;
it imports nothing else from the package), `src/config/<pkg>.config.ts` (the config class),
`src/core/` (isomorphic code: services, drivers, errors, functions, the config's options shape and
the views renderers share), `src/node/` (the module groups a service module has, `schemas/` for
action and query inputs and outputs, `database/` included), `src/react/<name>/` and
`src/native/<name>/` (renderers, each with its `<name>.props.ts`), `src/testing/` (fakes, matchers
and the factories and demo seeder tests use, ADR 0269; no runtime entry imports it, so Faker never
reaches a server), `assets/lang/<locale>/<ns>.json` (with regional overlays holding only the keys
that differ), and the committed `stackra.manifest.json` at the member root. Dependencies run one
way: core imports contracts; node, react and native import core; testing imports them all. No symbol
is exported from two entries. Shared pure helpers go to `@stackra/support` (foundation); there is no
`utils/` folder anywhere.
