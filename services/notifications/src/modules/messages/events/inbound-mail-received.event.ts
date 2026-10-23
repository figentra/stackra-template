/**
 * Stackra file contract:
 * Purpose: Resend's `email.received` webhook: a mail arrived at an inbound address, such as a
 *          customer's reply "CANCEL <order id>" to a confirmation.
 * Boundary: a webhook event of the Resend integration (`WebhookEvent<ResendIntegration>`): it names
 *           only the provider's event type. Verification and routing are declared once on
 *           ResendIntegration: the Standard Webhooks signature (Resend signs through Svix) is
 *           checked before any field is parsed, so a bad signature is refused and nothing runs
 *           (safeguard a), and the `type` field selects this class. The URL is per connection
 *           (`/webhooks/messages/resend/:connectionId`, the platform's own account included):
 *           a tenant connection's URL verifies only against that connection's own secret and the
 *           platform account's only against the platform secret, so an event signed for one is
 *           refused at the other. Listeners run in that connection's tenant. The fields are
 *           Resend's payload; CancelFromMailListener holds the logic and the other two
 *           safeguards, and acts only on the platform account's events. Resend receives
 *           2xx for every verified delivery, so it never retries a mail that will never qualify.
 *           The wire key is `messages.resend.email.received`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 5 and 16, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0224 (webhooks), ADR 0082 (areas), ADR 0173 (secret
 *                     names)
 */
import { WebhookEvent } from "@stackra/events";
import type { ResendIntegration } from "#modules/messages/integrations/resend.integration";
import type { ResendEmailReceivedData } from "#modules/messages/schemas/resend-email-received-data.schema";

/** Delivered at least once and deduplicated by the Svix message id. */
export class InboundMailReceived extends WebhookEvent<ResendIntegration>({
  type: "email.received",
}) {
  /** When Resend created the event, ISO 8601 on the wire. */
  created_at!: Date;

  /** The received mail's metadata; the body is read from Resend's API. */
  data!: ResendEmailReceivedData;
}
