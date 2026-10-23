<!--
Stackra file contract:
Purpose: the agent notes of @acme/service-notifications: its owner, local rules and the personal data it holds.
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
- Secrets: never in a file; runway.yaml names them and the secret store resolves them at run time.

## PII

| Data                     | Where                                      | Handling                                                                                              |
| ------------------------ | ------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `principalId`, `subject` | messages (`message.model.ts`)              | The address is resolved from identity at send time and never stored; the subject is kept for support. |
| `principalId`, `data`    | inbox entries (`inbox-message.model.ts`)   | Entries for one principal; tenant-scoped; read only by that principal.                                |
| `apiKey`                 | Resend connection (`resend.connection.ts`) | A tenant credential in the connection store, encrypted, never read back.                              |
