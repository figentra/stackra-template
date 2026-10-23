<!--
Stackra file contract:
Purpose: the agent notes of @acme/web: its owner, local rules and the personal data it holds.
Boundary: this member only; the project rules are in the root AGENTS.md.
Runtime: node
Governing contract: root AGENTS.md
-->

# AGENTS — @acme/web

- Owner: `@acme/platform-team` (`.github/CODEOWNERS`). This member is the public site (React Router
  7 on a Worker).
- UI, routes and server loaders only; data comes from the services through the generated clients
  (`#stackra/clients`).
- `.stackra/` holds generated samples; change `stackra.config.ts` or `src/` and rerun `stackra gen`,
  never edit them. The committed contract is `stackra.manifest.json` at the member root.
- A GET for HTML never sets a cookie (consent and the locale choice are written in the browser after
  the visitor acts); `landing.e2e.test.ts` asserts it on every page.
- No route module imports server-only code: clients and the server env reach loaders through the
  typed context keys the Worker fills (React Router middleware is on).
- Nothing is prerendered while `SiteConfig.fixedSiteId` is unset, and data is cached per query by
  its `CacheProfile`, never as HTML.
- Secrets: forbidden; secret values come from the project's secret store at run time.

## PII

| Data                | Where                                 | Handling                                                                                   |
| ------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------ |
| contact form fields | `src/routes/contact/contact.route.ts` | Validated in `submit` and sent to the owning service as a lead; the Worker stores nothing. |
| visitor address     | `.stackra/gen/clients.server.ts`      | Forwarded to the API signed with an HMAC on each call (ADR 0297 d6); never stored here.    |
