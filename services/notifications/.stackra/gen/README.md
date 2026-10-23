# .stackra (generated, gitignored; committed in this template only so it can be read)

`stackra gen` writes everything under `.stackra/` from one discovery pass over the member: each
file's path gives its kind, its base class gives its options, and its types give its shapes
(Stackra ADR 0294). Code imports the gen modules only as `#stackra/<name>`. Never edit: the next run
overwrites, and `stackra gen --check` fails CI when anything here is stale. The committed contract
is not here: `stackra.manifest.json` and `openapi.json` sit at the member root.

The full set is the same as in `services/commerce/.stackra/` (see its README for the table). Shown
here:

| File                  | Holds                                                                                        |
| --------------------- | -------------------------------------------------------------------------------------------- |
| `../entry/server.ts`  | the runtime entry: `createApp(NotificationsModule, { wiring })` from `@stackra/app/server`   |
| `../vitest.config.ts` | the Vitest config (the service preset); the gitignored root `vitest.config.ts` re-exports it |
| `wiring.ts`           | every binding, the config class, and the MailTransport drivers with the lazy `resend` one    |
| `clients.ts`          | commerce's call shapes, the `Commerce.OrderPaid` event class, the enum, the id prefixes      |
| `tables.ts`           | table and column constants per model, schema-qualified (`messages.messages`)                 |
| `i18n.ts`             | the complete `messages` key tree, with loaders                                               |
| `queues.ts`           | the worker queues this member may name (`delivery`, `inbox`)                                 |
| `manifest.ts`         | typed view of the committed `../../stackra.manifest.json`, and the typed refusal refs        |
