# @stackra/tsdown-config

Shared build preset. A library's `tsdown.config.ts` calls `libraryPreset`, the same role name the
vitest presets use, and passes only its entries:

```ts
import { libraryPreset } from "@stackra/tsdown-config";

export default libraryPreset(); // src/index.ts → dist/index.mjs + index.d.mts
```

Subpath exports name each entry, and the decorators flag adds the legacy-decorator transform (no
metadata, Stackra ADR 0005):

```ts
export default libraryPreset({ index: "src/index.ts", react: "src/react/index.ts" });
export default libraryPreset(undefined, { decorators: true });
```

Output is ESM only (`dist/*.mjs` and `.d.mts`, Stackra ADR 0025) with source maps, a clean `dist`
and tree-shaking.
