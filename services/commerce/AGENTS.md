<!--
Stackra file contract:
Purpose: the agent notes of @acme/service-commerce: its owner, local rules and the personal data it holds.
Boundary: this member only; the project rules are in the root AGENTS.md.
Runtime: node
Governing contract: root AGENTS.md
-->

# AGENTS — @acme/service-commerce

- Owner: `@acme/platform-team` (`.github/CODEOWNERS`). This member is the reference service
  (catalogue, inventory, orders, loyalty); `src/modules/orders` is the reference module.
- A file's path says its kind (`<group>/<name>.<kind>.ts`) and its class extends exactly one kind
  base; there are no kind decorators. Never hand-write Encore, a `main.ts` or a barrel:
  `stackra gen` writes them into `.stackra/`.
- Identities are derived and locked in `stackra.manifest.json`; renaming a class, key or field that
  carries one needs `@Renamed(old)`.
- Other services reach this one through events and generated clients only.
- Secrets: never in a file; runway.yaml names them and the secret store resolves them at run time.

## PII

| Data         | Where                     | Handling                                                                        |
| ------------ | ------------------------- | ------------------------------------------------------------------------------- |
| `customerId` | orders (`order.model.ts`) | A principal public id (`usr_…`), never a name or address; tenant-scoped; logged |
