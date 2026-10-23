# src/stores

Client state classes on `@stackra/state`: `extends Store({ persist })`, the fields are the state,
methods are the only writers, persistence is one option backed by `@stackra/storage`
(`state.config.ts` names the area; mmkv on native). The key is derived from the file
(`mobile.preferences`). Read with `useStore(PreferencesStore)` from `@stackra/state/react`, or
inject the class into a route or layout. Server state is never here (that is `@stackra/query`
through the generated clients).

| File                   | Class              | Persist             | Holds                          |
| ---------------------- | ------------------ | ------------------- | ------------------------------ |
| `preferences.store.ts` | `PreferencesStore` | `StorageArea.Prefs` | the remembered tenant per user |
