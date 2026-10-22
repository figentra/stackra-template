<!--
Stackra file contract:
Purpose: the agent notes of @acme/loyalty-kit: its owner, local rules and the personal data it holds.
Boundary: this member only; the project rules are in the root AGENTS.md.
Runtime: node
Governing contract: root AGENTS.md
-->

# AGENTS — @acme/loyalty-kit

- Owner: `@acme/platform-team` (`.github/CODEOWNERS`). This member is points, tiers and redemption
  as a module.
- The ledger is a port (`./contracts`); drivers self-register, consumers never import a driver.
- Never import an app or a service; a package depends only on packages.
- Secrets: forbidden; secret values come from the project's secret store at run time.

## PII

| Data      | Where                                     | Handling                                                   |
| --------- | ----------------------------------------- | ---------------------------------------------------------- |
| member id | ledger entries (`./node` postgres driver) | A branded public id (`MemberId`), never a name or address. |
