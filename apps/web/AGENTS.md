<!--
Stackra file contract:
Purpose: the agent notes of @acme/web: its owner, local rules and the personal data it holds.
Boundary: this member only; the project rules are in the root AGENTS.md.
Runtime: node
Governing contract: root AGENTS.md
-->

# AGENTS — @acme/web

- Owner: `@acme/platform-team` (`.github/CODEOWNERS`). This member is the public site (React Router 7 on a Worker).
- UI, routes and server loaders only; data comes from the services through the generated clients (`#stackra/clients`).
- `.stackra/` holds generated samples; change `stackra.config.ts` and rerun `stackra gen`, never edit them.
- A GET for HTML never sets a cookie (consent and the locale choice are written in the browser after the visitor
  acts); `landing.e2e.test.ts` asserts it on every page.
- No route module imports server-only code: clients and the server env reach loaders through the Worker's load context.
- Secrets: forbidden; secret values come from the project's secret store at run time.

## PII

| Data                | Where                         | Handling                                                                                   |
| ------------------- | ----------------------------- | ------------------------------------------------------------------------------------------ |
| contact form fields | `src/routes/contact.route.ts` | Validated in `submit` and sent to the owning service as a lead; the Worker stores nothing. |
