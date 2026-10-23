# @stackra/vitest-config

Shared vitest presets, one export per member role. `stackra gen` writes each member's
`.stackra/vitest.config.ts`, which calls its role and adds nothing else, plus a gitignored shim at
the member root for tools that read only the root (Stackra ADR 0295 decision 5):

```ts
// packages/commerce/loyalty-kit/.stackra/vitest.config.ts (generated)
import { fileURLToPath } from "node:url";
import { libraryPreset } from "@stackra/vitest-config";

export default libraryPreset({
  root: fileURLToPath(new URL("..", import.meta.url)),
  react: "src/react",
});
```

Only the preset packages in `packages/tooling` author their own `vitest.config.ts`
(`export default tooling`), because they hold no module and run no gen (Stackra ADR 0294 rule R12).

| Role            | Use for                                   | What it sets                                                                                        |
| --------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `libraryPreset` | packages (`packages/<category>/<name>`)   | `servicePreset` under the coverage gate, plus a jsdom `react` project for `react: "<folder>"`       |
| `servicePreset` | services                                  | legacy decorators; a `unit` project (`*.test.ts`) and an `int` project (`*.int.test.ts`)            |
| `appPreset`     | web and desktop apps                      | jsdom and legacy decorators; a node project per `nodeFolders` entry; `exclude` for e2e files        |
| `mobilePreset`  | the mobile app                            | jsdom and legacy decorators over every `*.test.ts` and `*.test.tsx`                                 |
| `tooling`       | the preset packages in `packages/tooling` | plain Node, explicit `vitest` imports, no decorators and no coverage gate: `export default tooling` |

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
