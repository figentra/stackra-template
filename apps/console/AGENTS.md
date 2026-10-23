<!--
Stackra file contract:
Purpose: the agent notes of @acme/console: its owner, local rules and the personal data it holds.
Boundary: this member only; the project rules are in the root AGENTS.md.
Runtime: node
Governing contract: root AGENTS.md
-->

# AGENTS — @acme/console

- Owner: `@acme/platform-team` (`.github/CODEOWNERS`). This member is the tenant console (web, PWA,
  desktop).
- UI and routes only; data comes from the services through the generated clients
  (`#stackra/clients`), and the session, tenant, query and realtime contexts are the packages',
  mounted from their config classes. `src/providers/` exists only for a `Module({ wrap })` component
  no package ships; the console has none.
- `.stackra/` holds generated samples; change `stackra.config.ts` or `src/` and rerun `stackra gen`,
  never edit them. The committed contract is `stackra.manifest.json` at the member root.
- Secrets: forbidden; secret values come from the project's secret store at run time.

## PII

| Data        | Where | Handling                                                                      |
| ----------- | ----- | ----------------------------------------------------------------------------- |
| none stored | —     | Renders what the services return; it keeps only UI preferences on the device. |
