<!--
Stackra file contract:
Purpose: the agent notes of @acme/service-commerce: its owner, local rules and the personal data it holds.
Boundary: this member only; the project rules are in the root AGENTS.md.
Runtime: node
Governing contract: root AGENTS.md
-->

# AGENTS — @acme/service-commerce

- Owner: your team (`.github/CODEOWNERS`). This member is the reference service (catalogue, inventory, orders, loyalty).
- Behaviour is decorated actions and queries; never hand-write Encore (`stackra gen` emits it).
- Other services reach this one through events and generated clients only.
- Secrets: forbidden; secret values come from the project's secret store at run time.

## PII

| Data         | Where                     | Handling                                                       |
| ------------ | ------------------------- | -------------------------------------------------------------- |
| `customerId` | orders (`order.model.ts`) | A principal public id, never a name or address; tenant-scoped. |
