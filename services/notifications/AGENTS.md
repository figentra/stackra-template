<!--
Stackra file contract:
Purpose: the agent notes of @acme/service-notifications: its owner, local rules and the personal
         data it holds.
Boundary: this member only; the project rules are in the root AGENTS.md.
Runtime: node
Governing contract: root AGENTS.md
-->

# AGENTS — @acme/service-notifications

- Owner: `@acme/platform-team` (`.github/CODEOWNERS`). This member is delivery, preferences, the
  message log and the in-app inbox.
- A file's path says its kind (`<group>/<name>.<kind>.ts`) and its class extends exactly one kind
  base; there are no kind decorators. Never hand-write Encore, a `main.ts` or a barrel:
  `stackra gen` writes them into `.stackra/`.
- Identities are derived and locked in `stackra.manifest.json`; renaming a class, key or field that
  carries one needs `@Renamed(old)`.
- Commerce is reached through events and generated clients only, never its source.
- Secrets: never in a file. A platform `@Secret` (DeliveryOptions, ResendIntegration) is named in
  runway.yaml and resolved by the secret store; a tenant `@Secret` (ResendConnection) lives in the
  connection store. `@stackra/integrations` is the one package for both kinds.
- Inbound mail acts for a customer only when it reached the platform's own inbound address and
  Resend reports DMARC `pass` (the `From` domain aligned with the passing DKIM or SPF domain) for
  exactly that customer's verified address; SPF and DKIM alone never suffice. Events on a tenant
  connection's URL verify only against that connection's required `webhookSecret` (no fallback to
  the platform secret) and never assert a platform customer's identity.

## PII

| Data                      | Where                                      | Handling                                                                                              |
| ------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `principalId`, `subject`  | messages (`message.model.ts`)              | The address is resolved from identity at send time and never stored; the subject is kept for support. |
| `principalId`, `data`     | inbox entries (`inbox-message.model.ts`)   | Entries for one principal; tenant-scoped; read only by that principal.                                |
| `apiKey`, `webhookSecret` | Resend connection (`resend.connection.ts`) | Tenant credentials in the connection store, envelope-encrypted, never read back or logged.            |
