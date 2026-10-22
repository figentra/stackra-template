<!--
Stackra file contract:
Purpose: the agent notes of @stackra/brand: its owner, local rules and the personal data it holds.
Boundary: this member only; the project rules are in the root AGENTS.md.
Runtime: node
Governing contract: root AGENTS.md
-->

# AGENTS — @stackra/brand

- Owner: your team (`.github/CODEOWNERS`). This member is design tokens and the product brand assets.
- One TypeScript token source in `src/`; the CSS in `css/` is generated from it.
- `assets/` is placeholder artwork for your product brand (see `assets/NOTICE`).
- Secrets: forbidden; secret values come from the project's secret store at run time.

## PII

| Data | Where | Handling                     |
| ---- | ----- | ---------------------------- |
| none | —     | Tokens and artwork; no data. |
