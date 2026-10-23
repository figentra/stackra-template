# src/stores

Client state classes on `@stackra/state` (ADR 0079): `extends Store({ persist })`, or the bare
`Store` for session-only state. The fields are the state, `set` is the only writer and methods its
only callers, getters are derived values; persistence is one option backed by `@stackra/storage`
(`state.config.ts` names the area). The key is derived from the file (`console.ui`). Read with
`useStore(UiStore)` from `@stackra/state/react`, or inject the class into a shortcut, route or menu.
Server state is never here (that is `@stackra/query` through the generated clients), and a
preference that must follow the user across devices is a setting, not a store.

| File               | Class          | Persist             | Holds                                              |
| ------------------ | -------------- | ------------------- | -------------------------------------------------- |
| `ui.store.ts`      | `UiStore`      | `StorageArea.Prefs` | the sidebar's collapsed flag and the table density |
| `palette.store.ts` | `PaletteStore` | none (session only) | whether the palette is open and the typed query    |

Tests: `__tests__/<name>.store.test.ts` with `mountStore` from `@stackra/state/testing`.
