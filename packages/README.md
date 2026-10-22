# packages

`packages/<category>/<name>`, one category per member, never a package directly under `packages/`
(workspace-layout rule). Categories: application, commerce, communication, cross-cutting, data,
developer, experience, foundation, infrastructure, runtime, security, state. In a framework project
these are `@stackra/*` public packages (home A, no product rules); in a product repository, `@acme/*`
private packages hold logic two services share (home B, ADR 0259) and use the same categories. A
package's module contributes exactly like a service's.

All three follow the decorator authoring model (ADR 0094): everything with identity is a class with a kind decorator;
strings declare, values reference (closed sets are class enums); the define family is retired; ports
are abstract classes that are their own token; drivers register themselves with `@Driver`; a module
is `@Module({ key, exports })` and nothing else; a package publishes through `publishConfig` (with
`exports` pointing at `dist`) and changesets, and has no `runway.yaml`. The module root of a package
is `package.json#stackra.module`; apps and services declare it in `stackra.config.ts`.

| Package                | Shows                                                                                                                                                                                                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `commerce/loyalty-kit` | the **shapes catalogue**: every declaration kind a package can hold, one per file, with its test and a "usually present" mark; a module with two abstract-class ports, two self-registering drivers (postgres on `@stackra/ledger`), `./react` and `./testing` entries |
| `security/access-log`  | a **decorator package**: `createDecorator`, the Explorer, the conformance test against gen, `@DriverOf` config and `@Replaces` for hosts, the retention job and the audit-trail resource, a `./testing` entry                                                          |
| `cross-cutting/brand`  | where brand lives: one TypeScript token source, `css/tokens.css` + `css/native.css` generated from it with `--brand-<group>-<name>` names, `brandCssVariables`, the mark                                                                                               |

Layout per package: `src/index.ts` (the `.` entry: schemas, errors, the config class, isomorphic
services), `src/contracts/` (ports, types and enums; no symbol is exported from two entries),
`src/core/<kind>/` (isomorphic kinds), `src/node/<kind>/` (the module and the same kind folders as a
service module), `src/react/`, `src/testing/` (fakes, factories, matchers for this package's
concepts, ADR 0269), `src/config/<pkg>.config.ts`, `assets/lang/<locale>/<ns>.json`, and
`.stackra/app-manifest.json` (committed). Shared pure helpers go to `@stackra/support` (foundation);
there is no `utils/` folder anywhere. Pure single-purpose functions of a package sit in
`src/core/functions/<name>.function.ts`.
