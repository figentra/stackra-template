<!--
Stackra file contract:
Purpose: the agent notes of @acme/docs: its owner, local rules and the personal data it holds.
Boundary: this member only; the project rules are in the root AGENTS.md.
Runtime: node
Governing contract: root AGENTS.md
-->

# AGENTS — @acme/docs

- Owner: `@acme/platform-team` (`.github/CODEOWNERS`). This member is the documentation site
  (Mintlify).
- Pages, `docs.json` and assets live in `src/`; the API reference is generated from the services'
  `openapi.json`.
- Deploys come from CI only, after the checks, through `runway.yaml` and the root runway's
  `targets.mintlify` (Stackra ADR 0299); never from a push to Mintlify.
- Secrets: forbidden; secret values come from the project's secret store at run time. The deploy job
  alone reads `MINTLIFY_ADMIN_KEY`.

## PII

| Data | Where | Handling                                   |
| ---- | ----- | ------------------------------------------ |
| none | —     | Static documentation; it collects no data. |
