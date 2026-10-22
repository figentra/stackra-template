# @acme/service-notifications

The second deployable. It shows **cross-service reach** in all three modes against commerce without importing a line
of commerce code (ADR 0260), and it is the one home of delivery, notification preferences, the message log and the
in-app inbox (ADR 0223: there is no notifications package; mail templates belong to the producer, ADR 0223).

| Mode    | Where                                        | Line                                                                  |
| ------- | -------------------------------------------- | --------------------------------------------------------------------- |
| event   | `listeners/notify-on-order-paid.listener.ts` | `@OnEvent(Commerce.events.OrderPaid, { queue: Queues.Inbox })`        |
| call    | same listener                                | `await this.commerce.order.get.call({ orderId })`                     |
| command | `webhooks/inbound-mail.webhook.ts`           | `await this.commerce.order.cancel.queue({ orderId }, { onBehalfOf })` |

And the reverse direction: commerce's `Mailer` driver `notifications` queues `messages.message.send` here with the
rendered parts of its mails.

| Path                                                                | What it is                                                                                |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `stackra.config.ts`, `runway.yaml`                                  | What the member is; how and where it runs (queues `delivery` with a dead letter, `inbox`) |
| `.stackra/app-manifest.json`, `.stackra/openapi.json`               | COMMITTED contract and its projection                                                     |
| `src/config/notifications.config.ts`                                | `@DriverOf(MailTransport) transport`, the platform sender, three `@Secret` references (Resend, inbound signing, the Web Push VAPID private key) |
| `src/modules/messages/actions/send-message.action.ts`               | the command target: opens the dedup row, dispatches delivery                              |
| `src/modules/messages/actions/deliver-message.action.ts`            | the job: five exponential retries, then the dead letter and `markFailed` (ADR 0148)       |
| `src/modules/messages/queries/list-notifications.query.ts`          | `messages.notification.list`: the caller's inbox, with the inbox-wide `unread` count      |
| `src/modules/messages/actions/mark-notification-read.action.ts`     | `messages.notification.mark_read`: `PUT /notifications/:notificationId/read`, own entries |
| `src/modules/messages/events/notification-created.event.ts`         | `messages.notification.created` (private, no version), on `principal.{principalId}.notifications` |
| `src/modules/messages/settings/notification-preferences.setting.ts` | user-scope `orderUpdates`, `orderReceipts`, `productUpdates`, `marketing`                 |
| `src/modules/messages/webhooks/inbound-mail.webhook.ts`             | `@Webhook` receiver, `ApiArea.Public`, with the three inbound-cancel safeguards           |
| `src/modules/messages/integrations/`, `connections/`                | Resend as an integration, and a tenant's own Resend credentials as a connection           |
| `src/modules/messages/drivers/`                                     | `@Driver(MailTransport, "memory" \| "resend")`; config picks one by name                  |
| `.stackra/gen/clients.ts`                                           | the generated commerce descriptors and `CommerceClient`                                   |

In `runway.yaml`, staging groups commerce and notifications in one deployable (`core`), so the clients call the other
service's action pipeline in-process; production splits them and the same code goes over RPC.
