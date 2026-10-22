<!--
Stackra file contract:
Purpose: the agent notes of @acme/mobile: its owner, local rules and the personal data it holds.
Boundary: this member only; the project rules are in the root AGENTS.md.
Runtime: node
Governing contract: root AGENTS.md
-->

# AGENTS — @acme/mobile

- Owner: `@acme/platform-team` (`.github/CODEOWNERS`). This member is the iOS and Android app (Expo).
- UI, routes and providers only; data comes from the services through the generated clients (`#stackra/clients`).
- `.stackra/` holds generated samples; change `stackra.config.ts` and rerun `stackra gen`, never edit them.
- Secrets: forbidden; secret values come from the project's secret store at run time.

## PII

| Data        | Where | Handling                                                                                           |
| ----------- | ----- | -------------------------------------------------------------------------------------------------- |
| none stored | —     | Renders what the services return; it keeps only UI preferences and queued mutations on the device. |
