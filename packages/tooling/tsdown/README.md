# @stackra/tsdown-config

Shared build preset. `stackra gen` writes each library's `.stackra/tsdown.config.ts` (with a
gitignored shim at the member root, Stackra ADR 0295 decision 5), which calls `libraryPreset`, the
same role name the vitest presets use, with one entry per `package.json` export. The entry barrels
are generated too, never authored (Stackra ADR 0294 decision 15), so the preset has no default
entry:

```ts
// packages/commerce/loyalty-kit/.stackra/tsdown.config.ts (generated)
import { libraryPreset } from "@stackra/tsdown-config";

export default libraryPreset({
  index: ".stackra/entry/index.ts",
  contracts: ".stackra/entry/contracts.ts",
  node: ".stackra/entry/node.ts",
  react: ".stackra/entry/react.ts",
  testing: ".stackra/entry/testing.ts",
});
```

The optional `{ decorators: true }` adds the legacy-decorator transform (no metadata, Stackra
ADR 0005) to the built output, for a package whose own tsconfig is not the `library` role.
Declarations come from tsdown's default tsc path; isolated declarations would refuse a called kind
base (`extends Action({ key })`, Stackra ADR 0300 decision 6).

Output is ESM only (`dist/*.mjs` and `.d.mts`, Stackra ADR 0025) with source maps, a clean `dist`
and tree-shaking.
