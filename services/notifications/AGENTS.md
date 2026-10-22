<!--
Stackra file contract:
Purpose: the agent notes of @acme/service-notifications: its owner, local rules and the personal data it holds.
Boundary: this member only; the project rules are in the root AGENTS.md.
Runtime: node
Governing contract: root AGENTS.md
-->

# AGENTS — @acme/service-notifications

- Owner: your team (`.github/CODEOWNERS`). This member is delivery, preferences, the message log and the in-app inbox.
- Behaviour is decorated actions and queries; never hand-write Encore (`stackra gen` emits it).
- Commerce is reached through events and generated clients only, never its source.
- Secrets: forbidden; secret values come from the project's secret store at run time.

## PII

| Data                     | Where                                   | Handling                                                                                              |
| ------------------------ | --------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `principalId`, `subject` | messages (`message.model.ts`)           | The address is resolved from identity at send time and never stored; the subject is kept for support. |
| `principalId`, `data`    | notifications (`notification.model.ts`) | Inbox entries for one principal; tenant-scoped.                                                       |
