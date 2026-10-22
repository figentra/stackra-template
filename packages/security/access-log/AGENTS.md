<!--
Stackra file contract:
Purpose: the agent notes of @stackra/access-log: its owner, local rules and the personal data it holds.
Boundary: this member only; the project rules are in the root AGENTS.md.
Runtime: node
Governing contract: root AGENTS.md
-->

# AGENTS — @stackra/access-log

- Owner: your team (`.github/CODEOWNERS`). This member is `@AccessLogged` and its access-log sinks.
- The sink is a port (`./contracts`); drivers self-register, consumers never import a driver.
- Never import an app or a service; a package depends only on packages.
- Secrets: forbidden; secret values come from the project's secret store at run time.

## PII

| Data                                             | Where                        | Handling                                                                |
| ------------------------------------------------ | ---------------------------- | ----------------------------------------------------------------------- |
| actor id and its `onBehalfOf` chain, subject ids | access records (sink driver) | Written for audit on every marked call; retention is the sink driver's. |
