# src/hooks

Hooks with two or more importers (ADR 0294 decision 14); a hook only one component uses sits beside
it as `use-<name>.ts`. A hook is a plain function, never a class, and its result type is in
`src/types/`.

| File                    | Hook               | Used by                              |
| ----------------------- | ------------------ | ------------------------------------ |
| `use-site.ts`           | `useSite`          | the site frame and the pricing table |
| `use-variant-choice.ts` | `useVariantChoice` | the product page and `VariantPicker` |

`useSite` refuses with `SiteContextMissingError` outside the site layout, a programming error.
Tests: `__tests__/` with `renderHook` from `@stackra/testing/react`.
