# @stackra/vitest-config

Shared vitest presets, one export per member role. A member's `vitest.config.ts` calls its role and
adds nothing else:

```ts
import { libraryPreset } from "@stackra/vitest-config";

export default libraryPreset({ root: import.meta.dirname, react: "src/react" });
```

| Role            | Use for                                        | What it sets                                                                                        |
| --------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `libraryPreset` | packages (`packages/<category>/<name>`)        | `servicePreset` under the coverage gate, plus a jsdom `react` project for `react: "<folder>"`       |
| `servicePreset` | services                                       | legacy decorators; a `unit` project (`*.test.ts`) and an `int` project (`*.int.test.ts`)            |
| `appPreset`     | web and desktop apps (`stackra gen` writes it) | jsdom and legacy decorators; a node project per `nodeFolders` entry; `exclude` for e2e files        |
| `mobilePreset`  | the mobile app (`stackra gen` writes it)       | jsdom and legacy decorators over every `*.test.ts` and `*.test.tsx`                                 |
| `tooling`       | the preset packages in `packages/tooling`      | plain Node, explicit `vitest` imports, no decorators and no coverage gate: `export default tooling` |

The same role names appear in `@stackra/tsdown-config` (`libraryPreset`) and as the
`@stackra/typescript-config` roles (`library`, `service`, `app`, `mobile`, `tooling`).

The building blocks stay exported for a config the roles do not cover:

| Export                | Holds                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------- |
| `./preset`            | `stackraVitest`, the base (globals, `passWithNoTests` off, node)                       |
| `./preset-decorators` | `stackraVitestDecorators` and `decoratorTransform` (Stackra ADR 0005, no metadata)     |
| `./preset-react`      | `stackraVitestReact` (jsdom)                                                           |
| `./coverage`          | `withCoverage`, `coverage` and `COVERAGE_THRESHOLDS` (lines/functions 80, branches 70) |

`passWithNoTests` is off on purpose: a package with no tests fails `pnpm test` until it has one. A
package runs the coverage gate with `pnpm test:coverage` (`vitest run --coverage`, provider
`@vitest/coverage-v8`, a dependency of this package).
