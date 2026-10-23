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
- The ledger is a port (`./contracts`); drivers are named by their file prefix and selected by
  config, so consumers never import a driver. Never write an entry barrel or a tool config: gen
  writes them into `.stackra/`.
- Never import an app or a service; a package depends only on packages.
- Secrets: forbidden; secret values come from the project's secret store at run time.

## PII

| Data      | Where                                          | Handling                                                                                                                                     |
| --------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| member id | loyalty accounts and ledger entries (`./node`) | A branded public id (`MemberId`), never a name or address; `LoyaltyAccount.memberId` carries `@Classified(DataClassification.Pseudonymous)`. |
