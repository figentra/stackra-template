# messages

One outbound message per queued call, delivered by a retried job; the in-app inbox; notification
preferences; the inbound-mail cancel. Producers render their own mail (React Email, through
`@stackra/notifications`) and queue `messages.message.send@1` with the subject, html and text; this
module keeps the dedup row, resolves the recipient and sends through the MailTransport port. Each
file's path says its kind and its class extends one kind base (Stackra ADR 0294).

| Group           | File                                                                 | Shows                                                                                                             |
| --------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| (root)          | `messages.module.ts`, `messages.settings.ts`                         | the bare `Module`; `Settings({ scopes: [SettingScope.User] })`                                                    |
| `models/`       | `message.model.ts`, `inbox-message.model.ts`                         | the dedup row (no address, no body) and the inbox entry; a `@Field(z…)` with a reason                             |
| `drivers/`      | `memory-mail-transport.driver.ts`, `resend-mail-transport.driver.ts` | `extends Driver(MailTransport)` of @stackra/notifications; the resend one prefers a tenant connection             |
| `actions/`      | `send-message.action.ts`                                             | the queued-call target: `Idempotency.Derived`, dispatches delivery after commit                                   |
| `actions/`      | `deliver-message.action.ts`                                          | a job: `job: { queue, retries, backoff, deadLetter, onDeadLetter }`                                               |
| `actions/`      | `mark-inbox-message-read.action.ts`                                  | an idempotent `PUT`, narrowed to the actor; a foreign entry is not found                                          |
| `queries/`      | `list-inbox-messages.query.ts`                                       | the inbox, narrowed to the actor, cursor-paginated, with the unread count                                         |
| `listeners/`    | `notify-on-order-paid.listener.ts`                                   | a remote event plus a call, honouring the user's preferences                                                      |
| `listeners/`    | `cancel-from-mail.listener.ts`                                       | the inbound cancel's DKIM, SPF and exact-address checks, then a queued call `onBehalfOf`                          |
| `events/`       | `inbound-mail-received.event.ts`                                     | `WebhookEvent({ path, scheme, secret })`: public and signature-verified                                           |
| `events/`       | `message-sent.event.ts`, `inbox-message-created.event.ts`            | integration events; the inbox refresh broadcasts to the principal's own sessions                                  |
| `integrations/` | `resend.integration.ts`                                              | `Integration({ provider })`: Resend shown in the console's integrations settings                                  |
| `connections/`  | `resend.connection.ts`                                               | `Connection(ResendIntegration)`: a tenant's own credentials (`@Secret("RESEND_TENANT_API_KEY")`), never read back |
| `access/`       | `message.permissions.ts`, `inbox-message.permissions.ts`             | message send and read, inbox message read and update; risk lives here                                             |
| `enums/`        | `*.enum.ts`                                                          | message status, inbox message kind, mail authentication result                                                    |
| `schemas/`      | `*.schema.ts`                                                        | shapes two or more files use; single-use inputs and outputs are companions                                        |
| `errors/`       | `*.error.ts`                                                         | the retryable provider refusal; `inbox_message_not_found`                                                         |
| `database/`     | `migrations/`, `factories/`                                          | the two tables; `MessageFactory.sent()`, `InboxMessageFactory.read()`                                             |
| tests           | `*/__tests__/`                                                       | `run`, `drainQueue`, `runJob` + `toDeadLetter`, `deliverWebhook`, `fakeClient`                                    |

The member root holds what the module reads but does not own: `assets/lang/<locale>/messages.json`,
the `I18n.messages.*` tree.
