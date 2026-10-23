<!--
Stackra file contract:
Purpose: the agent notes of @acme/brand: its owner, local rules and the personal data it holds.
Boundary: this member only; the project rules are in the root AGENTS.md.
Runtime: node
Governing contract: root AGENTS.md
-->

# AGENTS — @acme/brand

- Owner: `@acme/platform-team` (`.github/CODEOWNERS`). This member is design tokens and the product
  brand assets.
- One TypeScript token source in `src/core/constants/`, its names in `src/contracts/types/`; the CSS
  in `css/` is generated from it. Never write an entry barrel or a tool config: gen writes them into
  `.stackra/`.
- `assets/` holds the Acme example product's mark; a project replaces it with its own (see
  `assets/NOTICE`).
- Secrets: forbidden; secret values come from the project's secret store at run time.

## PII

| Data | Where | Handling                     |
| ---- | ----- | ---------------------------- |
| none | —     | Tokens and artwork; no data. |
