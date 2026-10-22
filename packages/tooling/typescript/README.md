# @stackra/typescript-config

tsconfig presets by member role. A member's `tsconfig.json` is exactly
`{ "extends": "@stackra/typescript-config/<role>" }` and nothing else: every compiler option and
every `include` lives here, with its reason below and in each preset's header (the presets are
JSONC, so they carry comments). Decorators are in every member (Stackra ADR 0094), so `app`,
`mobile`, `library` and `service` enable legacy decorators without metadata (Stackra ADR 0005).

| Role (export) | Extends   | Use for                                                                                                  |
| ------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| `app`         | `vite`    | a Vite or React Router app (`apps/console`, `apps/web`): src, stackra.config.ts, `*.extend.ts`, .stackra |
| `mobile`      | `base`    | the Expo app (`apps/mobile`): src, stackra.config.ts, `*.extend.ts`, .stackra                            |
| `library`     | `node`    | a tsdown-built package (`packages/<category>/<name>`), with DOM and JSX for its react and native entries |
| `service`     | `library` | a service member (`services/<name>`): src, stackra.config.ts, .stackra/gen                               |
| `tooling`     | `node`    | the preset packages in `packages/tooling`                                                                |
| `desktop`     | `node`    | only the Electron main and preload program gen writes into an app's `.stackra/desktop/`                  |
| `service-worker` | `base` | only the service-worker program gen writes beside an app's `.stackra/sw.ts` (WebWorker lib, no DOM)      |
| `encore`      | `node`    | only the Encore app gen emits into `.stackra/encore/`; never an authored member                          |
| `runtime`     | `library` | the tsx runtime loader for a package's `bin/` (never tsc or the build)                                   |

`base`, `node`, `react` and `vite` are building blocks inside this package and are not exported: a
member always extends a role.

## base

| Option                           | Why                                                                                            |
| -------------------------------- | ---------------------------------------------------------------------------------------------- |
| `target: ES2022`                 | Node ≥ 24 and evergreen browsers run it; tsdown/vite pick the real emit target from `engines`. |
| `module: ESNext`                 | ESM only, everywhere.                                                                          |
| `moduleResolution: bundler`      | Output is always produced by a bundler (rolldown via tsdown/vite).                             |
| `strict`                         | Baseline.                                                                                      |
| `exactOptionalPropertyTypes`     | `{ a?: T }` does not accept an explicit `undefined`; keeps API and IR contracts honest.        |
| `noUncheckedIndexedAccess`       | `arr[i]` is `T \| undefined` — catches the most common runtime crash class.                    |
| `isolatedModules`                | Every file must be transpilable alone — required by oxc, which transforms per file.            |
| `verbatimModuleSyntax`           | Imports are emitted exactly as written; `import type` is the only erased form.                 |
| `allowImportingTsExtensions`     | The tooling presets say `./x.ts`, so plain Node's type stripping loads them unbundled.         |
| `declaration` + `declarationMap` | tsdown's dts step reads these: `.d.ts` for consumers, `.d.ts.map` for go-to-source.            |
| `noImplicitOverride`             | `override` is mandatory on overriding members.                                                 |
| `noImplicitReturns`              | Every code path returns.                                                                       |
| `noUnusedLocals` / `Parameters`  | Dead code never ships; prefix `_` for intentionally unused parameters.                         |
| `skipLibCheck`                   | Do not re-check third-party `.d.ts`.                                                           |

`encore` relaxes four flags because the generated `encore.gen` glue trips them; oxlint enforces the
same hygiene on authored code. Every `exclude` uses `${configDir}`, so it resolves in the member,
not in this package.
