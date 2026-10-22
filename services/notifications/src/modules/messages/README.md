# messages

One outbound message per command, delivered by a retried job; the in-app inbox; notification preferences; the
inbound-mail receiver. Producers render their own mail (React Email) and queue `message.send` with subject, html and
text; this module keeps the dedup row, resolves the recipient and sends through the `MailTransport` port.

| Kind        | File                                                      | Shows                                                                          |
| ----------- | --------------------------------------------------------- | ------------------------------------------------------------------------------ |
| port        | `contracts/mail-transport.port.ts`                        | an abstract class that is its own token                                        |
| drivers     | `drivers/*.driver.ts`                                     | `memory` and `resend`; the resend driver prefers a tenant's own connection     |
| action      | `actions/send-message.action.ts`                          | the command target: `idempotency: "derived"`, dispatches delivery after commit |
| job         | `actions/deliver-message.action.ts`                       | `@AsJob` with retries, `Backoff.Exponential`, `deadLetter`, `onDeadLetter`     |
| query       | `queries/list-notifications.query.ts`                     | the inbox, narrowed to the actor, cursor-paginated, with the unread count      |
| action      | `actions/mark-notification-read.action.ts`                | idempotent `PUT`, narrowed to the actor; a foreign entry is not found          |
| listener    | `listeners/notify-on-order-paid.listener.ts`              | a remote event plus a call, honouring the user's preferences                   |
| setting     | `settings/notification-preferences.setting.ts`            | `@Settings({ scopes: [SettingScope.User] })`                                   |
| webhook     | `webhooks/inbound-mail.webhook.ts`                        | `@Webhook` receiver: signature, DKIM/SPF and exact address, `onBehalfOf`       |
| integration | `integrations/resend.integration.ts`                      | `@Integration`: shown in the console's integrations settings                   |
| connection  | `connections/resend.connection.ts`                        | `@Connection`: a tenant's own credentials, never read back                     |
| models      | `models/message.model.ts`, `models/notification.model.ts` | the dedup row (no address, no body) and the inbox entry                        |
| enums       | `enums/*.enum.ts`                                         | message status, notification kind, mail authentication result                  |
| schemas     | `schemas/*.schema.ts`                                     | one schema per file                                                            |
| permissions | `permissions/*.permission.ts`                             | message send and read, notification read and update; risk lives here           |
| event       | `events/message-sent.event.ts`                            | public `@Event`, recorded on the aggregate                                     |
| event       | `events/notification-created.event.ts`                    | private `@Event` broadcast on the principal's own channel                      |
| errors      | `errors/*.error.ts`                                       | the retryable provider refusal; `notification_not_found`                       |
| factories   | `factories/*.factory.ts`                                  | `Factory<Message>`, `Factory<Notification>`                                    |
| migrations  | `migrations/*.migration.ts`                               | diff output of the two tables                                                  |
| tests       | `*/__tests__/`                                            | `run`, `drainQueue`, `runJob` + `toDeadLetter`, `deliverWebhook`, `fakeClient` |
