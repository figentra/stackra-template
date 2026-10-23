<!--
Stackra file contract:
Purpose: the agent notes of @acme/service-commerce: its owner, local rules and the personal data it
         holds.
Boundary: this member only; the project rules are in the root AGENTS.md.
Runtime: node
Governing contract: root AGENTS.md
-->

# AGENTS — @acme/service-commerce

- Owner: `@acme/platform-team` (`.github/CODEOWNERS`). This member is the reference service
  (catalogue, inventory, orders, loyalty); `src/modules/orders` is the reference module.
- A file's path says its kind (`<group>/<name>.<kind>.ts`) and its class extends exactly one kind
  base; there are no kind decorators. Never hand-write Encore, a `main.ts`, a barrel or an empty
  module file: `stackra gen` writes them into `.stackra/`.
- One exported declaration per file: an action's or query's Input and Output are
  `schemas/<name>-input.schema.ts` and `schemas/<name>-output.schema.ts`, a notification's data is
  `schemas/<name>-data.schema.ts`, a constant is `constants/<name>.constant.ts`.
- A partner is a type argument (`Policy<Order>`, `Factory<Order>`, `Resource<Order, OrderView>`,
  `Widget<OrderKpisQuery>`, `Extension<OrderExtensionPoint["adjustTotals"]>`); a value argument only
  where members are inherited (`Driver(Port)`, an override's `Base` class).
- Migrations are frozen snapshots: they import only `@stackra/database` and `#stackra/migrations`,
  use literals and partner macros, and have no `down()`.
- Identities are derived and locked in `stackra.manifest.json`; renaming a class, key or field that
  carries one needs `@Renamed(old)`.
- Other services reach this one through events and generated clients only.
- Secrets: never in a file; runway.yaml names them and the secret store resolves them at run time.

## PII

| Data         | Where                     | Handling                                                                        |
| ------------ | ------------------------- | ------------------------------------------------------------------------------- |
| `customerId` | orders (`order.model.ts`) | A principal public id (`usr_…`), never a name or address; tenant-scoped; logged |
