<!--
Stackra file contract:
Purpose: the agent notes of @acme/theme: its owner, local rules and the personal data it holds.
Boundary: this member only; the project rules are in the root AGENTS.md.
Runtime: node
Governing contract: root AGENTS.md
-->

# AGENTS — @acme/theme

- Owner: `@acme/platform-team` (`.github/CODEOWNERS`). This member is the example product's theme of
  the Stackra Design System (Stackra ADR 0302) and its mark.
- A value changes in `src/core/constants/acme-theme.constant.ts` only; then
  `pnpm --filter @acme/theme exec vitest run -u` rewrites
  `assets/public/themes/acme/{web,native}.css`. Never edit those files by hand, and never write a
  hex by hand: derive it with `oklchToHex`.
- Name a role only where Acme differs from the stackra theme; the spread keeps the rest. Keep every
  text pair at 4.5:1 or more in both modes (the test checks it).
- `assets/public/images/mark.svg` is the Acme example mark; a project replaces it with its own (see
  `assets/NOTICE`).
- Never write an entry barrel, a root module or a tool config: gen writes them into `.stackra/`.
- Secrets: forbidden; secret values come from the project's secret store at run time.

## PII

| Data | Where | Handling                           |
| ---- | ----- | ---------------------------------- |
| none | —     | Theme values and artwork; no data. |
