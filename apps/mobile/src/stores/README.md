# src/stores

`@Store({ key, persist })` classes extending `StoreBase<State>` on `@stackra/state` : writers are
methods, selectors are getters, persistence is one option backed by `@stackra/storage`
(`state.config.ts` names the store; mmkv on native). Read with `useStore(PreferencesStore)` from
`@stackra/state/react`. Server state is never here (that is `@stackra/query` through the generated
clients).

| File                   | Key           | Persist             | Holds                          |
| ---------------------- | ------------- | ------------------- | ------------------------------ |
| `preferences.store.ts` | `preferences` | `StorageArea.Prefs` | the remembered tenant per user |
