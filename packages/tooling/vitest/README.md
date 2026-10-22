# @stackra/vitest-config

Shared vitest presets. A member's `vitest.config.ts` calls one factory and adds nothing else:

```ts
import { libraryPreset } from "@stackra/vitest-config";

export default libraryPreset({ root: import.meta.dirname, react: "src/react" });
```

| Factory         | Use for                                    | What it sets                                                                                 |
| --------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `nodePreset`    | services                                   | legacy decorators; a `unit` project (`*.test.ts`) and an `int` project (`*.int.test.ts`)     |
| `libraryPreset` | packages                                   | `nodePreset` under the coverage gate, plus a jsdom `react` project for `react: "<folder>"`   |
| `reactPreset`   | web apps (`stackra gen` writes the config) | jsdom and legacy decorators; a node project per `nodeFolders` entry; `exclude` for e2e files |
| `nativePreset`  | the mobile app (`stackra gen` writes it)   | jsdom and legacy decorators over every `*.test.ts` and `*.test.tsx`                          |

The building blocks stay exported for a config the factories do not cover:

| Export                | Holds                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------- |
| `./preset`            | `stackraVitest`, the base (globals, `passWithNoTests` off, node)                       |
| `./preset-decorators` | `stackraVitestDecorators` and `decoratorTransform` (ADR-0005, no metadata)             |
| `./preset-react`      | `stackraVitestReact` (jsdom)                                                           |
| `./coverage`          | `withCoverage`, `coverage` and `COVERAGE_THRESHOLDS` (lines/functions 80, branches 70) |

`passWithNoTests` is off on purpose: a package with no tests fails `pnpm test` until it has one. A package runs
the coverage gate with `pnpm test:coverage` (`vitest run --coverage`, provider `@vitest/coverage-v8`).
