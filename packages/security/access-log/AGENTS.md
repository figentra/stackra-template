<!--
Stackra file contract:
Purpose: the agent notes of @acme/access-log: its owner, local rules and the personal data it holds.
Boundary: this member only; the project rules are in the root AGENTS.md.
Runtime: node
Governing contract: root AGENTS.md
-->

# AGENTS — @acme/access-log

- Owner: `@acme/platform-team` (`.github/CODEOWNERS`). This member is the `@AccessLogged` class
  facet and its access-log sinks.
- The sink is a port (`./contracts`); drivers are named by their file prefix and selected by config,
  so consumers never import a driver. Never write an entry barrel or a tool config: gen writes them
  into `.stackra/`.
- Never import an app or a service; a package depends only on packages.
- Secrets: forbidden; secret values come from the project's secret store at run time.

## PII

| Data                                             | Where                        | Handling                                                                                                          |
| ------------------------------------------------ | ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| actor id and its `onBehalfOf` chain, subject ids | access records (sink driver) | Written for audit on every call of a marked class that touched a subject; the purge job enforces `retentionDays`. |
