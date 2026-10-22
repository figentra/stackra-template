# @stackra/typescript-config

tsconfig presets, imported by file name. A member's `tsconfig.json` is
`{ "extends": "@stackra/typescript-config/<preset>.json" }` (plus the `include` gen needs) and nothing else: every
compiler option lives here, with its reason below (JSON cannot carry comments, JSONC can, so every preset file has a
header). Decorators are everywhere in v2 (ADR 0094), so `library`, `service`, `app` and `expo` all enable legacy
decorators without metadata (ADR 0005).

| Preset                  | Extends      | Use for                                                                         |
| ----------------------- | ------------ | ------------------------------------------------------------------------------- |
| `base.json`             | —            | never directly; the shared baseline                                             |
| `node.json`             | `base`       | Node scripts and tooling                                                        |
| `library.json`          | `node`       | a tsdown-built package (`packages/<category>/<name>`), legacy decorators on     |
| `decorators.json`       | `library`    | kept for the tooling and runtime presets; same flags as `library` now           |
| `decorators-react.json` | `decorators` | a package with decorators + React (DOM lib, automatic JSX)                      |
| `service.json`          | `decorators` | a service member (`services/<name>`): src, stackra.config.ts, .stackra/gen      |
| `runtime.json`          | `decorators` | the tsx runtime loader for a package's `bin/` (never tsc or the build)          |
| `encore.json`           | `node`       | only the Encore app gen emits into `.stackra/encore/`; never an authored member |
| `expo.json`             | `base`       | Expo / React Native apps (`apps/mobile`), decorators on                         |
| `react.json`            | `base`       | React 19 libraries (DOM lib, automatic JSX)                                     |
| `vite.json`             | `react`      | Vite + React builds                                                             |
| `app.json`              | `vite`       | a Vite or React Router app (`apps/console`, `apps/web`), decorators on          |
| `vite-node.json`        | `node`       | the tooling packages whose config files Vite loads                              |

## base

| Option                           | Why                                                                                                    |
| -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `target: ES2022`                 | Node ≥ 24 and evergreen browsers run it; tsdown/vite pick the real emit target from `engines`.         |
| `module: ESNext`                 | ESM only, everywhere.                                                                                  |
| `moduleResolution: bundler`      | Output is always produced by a bundler (rolldown via tsdown/vite).                                     |
| `strict`                         | Baseline.                                                                                              |
| `exactOptionalPropertyTypes`     | `{ a?: T }` does not accept an explicit `undefined`; keeps API and IR contracts honest.                |
| `noUncheckedIndexedAccess`       | `arr[i]` is `T \| undefined` — catches the most common runtime crash class.                            |
| `isolatedModules`                | Every file must be transpilable alone — required by oxc, which transforms per file.                    |
| `verbatimModuleSyntax`           | Imports are emitted exactly as written; `import type` is the only erased form.                         |
| `allowImportingTsExtensions`     | Relative imports inside packages say `./x.ts` so Node's type-stripping loader resolves them unbundled. |
| `declaration` + `declarationMap` | tsdown's dts step reads these: `.d.ts` for consumers, `.d.ts.map` for go-to-source.                    |
| `noImplicitOverride`             | `override` is mandatory on overriding members.                                                         |
| `noImplicitReturns`              | Every code path returns.                                                                               |
| `noUnusedLocals` / `Parameters`  | Dead code never ships; prefix `_` for intentionally unused parameters.                                 |
| `skipLibCheck`                   | Do not re-check third-party `.d.ts`.                                                                   |
| `paths: @/* → src/*`             | The `@/` alias used by apps and tests (vitest configs mirror it).                                      |

`encore` relaxes four flags because `encore.dev` ships `.ts` sources that trip them; oxlint enforces the same
hygiene on our own code there.
