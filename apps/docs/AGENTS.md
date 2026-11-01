<!--
Stackra file contract:
Purpose: the agent notes of @acme/docs: its owner, the docs layout, local rules and the personal data it holds.
Boundary: this member only; the project rules are in the root AGENTS.md.
Runtime: node
Governing contract: root AGENTS.md; Stackra ADR 0002 (2026-10-27 amendment)
-->

# AGENTS — @acme/docs

- Owner: `@acme/platform-team` (`.github/CODEOWNERS`). This member is the documentation site
  (Mintlify).
- Pages in `src/docs/` (ADRs in `src/docs/adr/`), assets in `src/assets/`, the site in
  `src/config/docs.config.ts` (a `DocsConfig` subclass from `@stackra/gen`). Member files
  (`README.md`, `AGENTS.md`, `package.json`, `stackra.config.ts`, `tsconfig.json`) stay outside
  `src/`.
- Never write `docs.json`, `llms.txt` or `api-reference/*/openapi.json`: gen writes them into
  `.stackra/site/` from the config and the services' committed manifests; `.stackra/site/` is never
  edited or committed.
- A new page is listed in a group of the config (a new ADR is listed by the `adr` folder entry).
- Deploys come from CI only, after the checks, through `runway.yaml` and the root runway's
  `targets.mintlify` (Stackra ADR 0299); never from a push to Mintlify.
- Secrets: forbidden; secret values come from the project's secret store at run time. The deploy job
  alone reads `MINTLIFY_ADMIN_KEY`.

## PII

| Data | Where | Handling                                   |
| ---- | ----- | ------------------------------------------ |
| none | —     | Static documentation; it collects no data. |
