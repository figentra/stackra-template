# @acme/service-notifications

The second deployable. It shows **cross-service reach** in every mode against commerce without
importing a line of commerce code (ADR 0260), and it is the one home of delivery, notification
preferences, the message log and the in-app inbox (ADR 0223). Mail templates belong to the producer:
commerce renders its notifications through `@stackra/notifications` and queues the result here. Each
file's path says its kind, its class extends one kind base and a partner is a type argument (Stackra
ADR 0294, as amended by the programming model v3.1).

| Mode        | Where                                        | Line                                                                  |
| ----------- | -------------------------------------------- | --------------------------------------------------------------------- |
| event       | `listeners/notify-on-order-paid.listener.ts` | `handle(event: OrderPaid)` on `Listener({ queue: Queues.Inbox })`     |
| call        | same listener                                | `await this.commerce.order.get.call({ orderId })`                     |
| queued call | `listeners/cancel-from-mail.listener.ts`     | `await this.commerce.order.cancel.queue({ orderId }, { onBehalfOf })` |

And the reverse direction: commerce's `notifications` Notifier driver queues
`messages.message.send@1` here with the rendered parts of its mails.

| Path                                                             | What it is                                                                                                                         |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `stackra.config.ts`                                              | What the member is: API area, health checks, migration runner (`defineService`, static data)                                       |
| `runway.yaml`                                                    | What it needs per environment: platform secret names (Resend's and Web Push's), queue settings, config values                      |
| `stackra.manifest.json`, `openapi.json`                          | COMMITTED contract and its projection; commerce's generated `NotificationsClient` is built from it                                 |
| `.stackra/`                                                      | What `stackra gen` writes (gitignored; committed here to read): the entry, wiring, clients, tables, …                              |
| `src/config/delivery.config.ts`                                  | `DeliveryConfig extends Config({ schema: DeliveryOptions })` (key `notifications.delivery`): transport, sender, Web Push key       |
| `src/modules/messages/messages.settings.ts`                      | user-scope preferences in two sections, `orders` and `promotions`, every field shipped to clients                                  |
| `src/modules/messages/actions/send-message.action.ts`            | the queued-call target: opens the dedup row, dispatches delivery                                                                   |
| `src/modules/messages/actions/deliver-message.action.ts`         | the job: five exponential retries, then the dead letter and `markFailed` (ADR 0148)                                                |
| `src/modules/messages/queries/list-inbox-messages.query.ts`      | `messages.inbox_message.list@1`: the caller's inbox, with the inbox-wide `unread` count                                            |
| `src/modules/messages/actions/mark-inbox-message-read.action.ts` | `messages.inbox_message.mark_read@1`: `PUT /inbox-messages/:inboxMessageId/read`, own entries only                                 |
| `src/modules/messages/events/inbox-message-created.event.ts`     | `messages.inbox_message.created.v1`, broadcast as a data-free refresh to the principal's own sessions                              |
| `src/modules/messages/events/inbound-mail-received.event.ts`     | `WebhookEvent<ResendIntegration>({ type: "email.received" })`: verified by the integration, the first inbound-cancel safeguard     |
| `src/modules/messages/listeners/cancel-from-mail.listener.ts`    | platform inbox only, DMARC pass and the exact verified address, then the queued cancel on behalf of the customer                   |
| `src/modules/messages/integrations/`, `connections/`             | Resend as an Integration (auth, limits, retries, webhooks, platform `@Secret`s) and `Connection<ResendIntegration>` with `check()` |
| `src/modules/messages/drivers/`                                  | `extends Driver(MailTransport)`, named `memory` and `resend`; the resend one sends through the integration's managed client        |

The MailTransport port comes from `@stackra/notifications/contracts`, because a port is declared in
a package and implemented by its drivers (ADR 0294 decision 16). Whether notifications runs beside
commerce or apart is the root runway's topology: in a shared group the clients call the other
service's pipeline in-process, apart they go over RPC, and the code does not change.
