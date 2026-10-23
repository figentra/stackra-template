# messages

One outbound message per queued call, delivered by a retried job; the in-app inbox; notification
preferences; the inbound-mail cancel. Producers render their own mail (React Email, through
`@stackra/notifications`) and queue `messages.message.send@1` with the subject, html and text; this
module keeps the dedup row, resolves the recipient and sends through the MailTransport port. Each
file's path says its kind and its class extends one kind base (Stackra ADR 0294, as amended by the
programming model v3.1). There is no `messages.module.ts`: it exports nothing, so the folder is the
module.

| Group           | File                                                                 | Shows                                                                                                     |
| --------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| (root)          | `messages.settings.ts`                                               | `Settings({ scopes: [SettingScope.User] })` with two sections                                             |
| `models/`       | `message.model.ts`, `inbox-message.model.ts`                         | the dedup row (no address, no body) and the inbox entry; a `@Field(z…)` with a reason                     |
| `drivers/`      | `memory-mail-transport.driver.ts`, `resend-mail-transport.driver.ts` | `extends Driver(MailTransport)`; the resend one uses the connection's or the integration's managed client |
| `actions/`      | `send-message.action.ts`                                             | the queued-call target: `Idempotency.Derived`, dispatches delivery after commit                           |
| `actions/`      | `deliver-message.action.ts`                                          | a job: `job: { queue, retries, backoff, deadLetter, onDeadLetter }`                                       |
| `actions/`      | `mark-inbox-message-read.action.ts`                                  | an idempotent `PUT`, narrowed to the actor; a foreign entry is not found                                  |
| `queries/`      | `list-inbox-messages.query.ts`                                       | the inbox, narrowed to the actor, cursor-paginated, with the unread count                                 |
| `listeners/`    | `notify-on-order-paid.listener.ts`                                   | a remote event plus a call, honouring the user's preferences                                              |
| `listeners/`    | `cancel-from-mail.listener.ts`                                       | platform inbox only; DMARC pass (alignment) and exact-address checks; a queued call `onBehalfOf`          |
| `constants/`    | `cancel-request.constant.ts`                                         | the cancel pattern, built from commerce's order id prefix in the generated client                         |
| `events/`       | `inbound-mail-received.event.ts`                                     | `WebhookEvent<ResendIntegration>({ type })`: verified and routed by the integration                       |
| `events/`       | `message-sent.event.ts`, `inbox-message-created.event.ts`            | integration events; the inbox refresh broadcasts to the principal's own sessions                          |
| `integrations/` | `resend.integration.ts`                                              | auth, base URL, rate limits, retry, health, webhooks, listing, platform `@Secret` fields                  |
| `connections/`  | `resend.connection.ts`                                               | `Connection<ResendIntegration>`: tenant `@Secret` fields (webhook secret required) and a real `check()`   |
| `access/`       | `message.permissions.ts`, `inbox-message.permissions.ts`             | message send and read, inbox message read and update; risk lives here                                     |
| `enums/`        | `*.enum.ts`                                                          | message status, inbox message kind, mail authentication result                                            |
| `schemas/`      | `*.schema.ts`                                                        | every Input and Output, the settings sections and Resend's payloads, one per file                         |
| `errors/`       | `inbox-message-not-found.error.ts`                                   | `inbox_message_not_found`; provider failures are the integrations package's refusals                      |
| `database/`     | `migrations/`, `factories/`                                          | the two tables; `MessageFactory.sent()`, `InboxMessageFactory.read()`                                     |
| tests           | `*/__tests__/`                                                       | `run`, `drainQueue`, `runJob` + `toDeadLetter`, `deliverWebhook`, `fakeClient`                            |

The member root holds what the module reads but does not own: `assets/lang/<locale>/messages.json`,
the `I18n.messages.*` tree.
