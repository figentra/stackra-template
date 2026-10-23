# @acme/service-notifications

The second deployable. It shows **cross-service reach** in every mode against commerce without
importing a line of commerce code (ADR 0260), and it is the one home of delivery, notification
preferences, the message log and the in-app inbox (ADR 0223). Mail templates belong to the producer:
commerce renders its notifications through `@stackra/notifications` and queues the result here. Each
file's path says its kind and its class extends one kind base (Stackra ADR 0294).

| Mode        | Where                                        | Line                                                                       |
| ----------- | -------------------------------------------- | -------------------------------------------------------------------------- |
| event       | `listeners/notify-on-order-paid.listener.ts` | `handle(event: Commerce.OrderPaid)` on `Listener({ queue: Queues.Inbox })` |
| call        | same listener                                | `await this.commerce.order.get.call({ orderId })`                          |
| queued call | `listeners/cancel-from-mail.listener.ts`     | `await this.commerce.order.cancel.queue({ orderId }, { onBehalfOf })`      |

And the reverse direction: commerce's `notifications` Notifier driver queues
`messages.message.send@1` here with the rendered parts of its mails.

| Path                                                            | What it is                                                                                                                             |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `stackra.config.ts`                                             | What the member is: API area, health checks, migration runner (`defineService`, static data)                                           |
| `runway.yaml`                                                   | What it needs per environment: secret names, queue settings (`delivery` with a dead letter, `inbox`)                                   |
| `stackra.manifest.json`, `openapi.json`                         | COMMITTED contract and its projection; commerce's generated `NotificationsClient` is built from it                                     |
| `.stackra/`                                                     | What `stackra gen` writes (gitignored; committed here to read): the entry, wiring, clients, tables, …                                  |
| `src/notifications.module.ts`                                   | The root module: the bare `extends Module`, because it hosts no package                                                                |
| `src/config/delivery.config.ts`                                 | `DeliveryConfig` (key `notifications.delivery`): `transport: DriverName<MailTransport>`, the platform sender, two `@Secret` references |
| `src/modules/messages/messages.settings.ts`                     | user-scope `orderUpdates`, `orderReceipts`, `productUpdates`, `marketing`                                                              |
| `src/modules/messages/actions/send-message.action.ts`           | the queued-call target: opens the dedup row, dispatches delivery                                                                       |
| `src/modules/messages/actions/deliver-message.action.ts`        | the job: five exponential retries, then the dead letter and `markFailed` (ADR 0148)                                                    |
| `src/modules/messages/queries/list-notifications.query.ts`      | `messages.notification.list@1`: the caller's inbox, with the inbox-wide `unread` count                                                 |
| `src/modules/messages/actions/mark-notification-read.action.ts` | `messages.notification.mark_read@1`: `PUT /notifications/:notificationId/read`, own entries only                                       |
| `src/modules/messages/events/notification-created.event.ts`     | `messages.notification.created.v1`, broadcast as a data-free refresh with its read permission                                          |
| `src/modules/messages/events/inbound-mail-received.event.ts`    | a `WebhookEvent`: public, signature-verified, the first of the three inbound-cancel safeguards                                         |
| `src/modules/messages/listeners/cancel-from-mail.listener.ts`   | the other two safeguards, then the queued cancel on behalf of the customer                                                             |
| `src/modules/messages/integrations/`, `connections/`            | Resend as an integration, and a tenant's own Resend credentials as a connection                                                        |
| `src/modules/messages/drivers/`                                 | `extends Driver(MailTransport)`, named `memory` and `resend` by their file prefixes; config picks one                                  |

The MailTransport port comes from `@stackra/notifications/contracts`, because a port is declared in
a package and implemented by its drivers (ADR 0294 decision 16). Whether notifications runs beside
commerce or apart is the root runway's topology: in a shared group the clients call the other
service's pipeline in-process, apart they go over RPC, and the code does not change.
