/**
 * Stackra file contract:
 * Purpose: the receiver the mail provider posts inbound replies to. A customer replying "CANCEL
 *          <order id>" to their confirmation cancels that unpaid order through commerce's action,
 *          as a command.
 * Boundary: a `@Webhook` receiver (@stackra/webhooks), `ApiArea.Public`, not an action. Its three
 *           safeguards all hold before anything is queued: (a) the package verifies the
 *           provider's Standard Webhooks signature before this class runs; (b) the sender acts for
 *           a customer only on a DKIM and SPF pass plus an exact match with that customer's
 *           verified email; (c) the cancel runs `onBehalfOf` the customer, so commerce's
 *           OrderPolicy.cancel decides as them (own orders, unpaid only), and commerce access-logs
 *           every such cancel. Anything else is accepted and dropped, so the provider stops
 *           retrying.
 * Runtime: node
 * Governing contract: ADR 0082 (areas), ADR 0260 d4 (command mode)
 */
import type { IdentityResolver } from "@stackra/contracts";
import { ApiArea } from "@stackra/contracts";
import { SignatureScheme, Webhook } from "@stackra/webhooks";
import type { CommerceClient } from "#stackra/clients";
import { Commerce } from "#stackra/clients";
import type { NotificationsConfig } from "#config/notifications.config";
import { InboundMailPayload } from "#modules/messages/schemas/inbound-mail-payload.schema";
import { MailAuthResult } from "#modules/messages/enums/mail-auth-result.enum";

/** "CANCEL" then one commerce order id, built from the id prefix in commerce's manifest. */
const CANCEL_REQUEST = new RegExp(
  `^\\s*CANCEL\\s+(${Commerce.publicIds.Order}_[a-z0-9]{26})\\b`,
  "i",
);

/** Public, signature-verified; the payload reaches `receive` already parsed. */
@Webhook({
  path: "/webhooks/inbound-mail",
  area: ApiArea.Public,
  scheme: SignatureScheme.StandardWebhooks,
  secret: (config: NotificationsConfig) => config.inboundSigningSecret,
  payload: InboundMailPayload,
})
export class InboundMailWebhook {
  constructor(
    private readonly commerce: CommerceClient,
    private readonly identity: IdentityResolver,
  ) {}

  /**
   * Queues the cancel only when the sender is proven to be the customer. Returns normally in every
   * other case: a refusal would only make the provider retry a mail that will never qualify.
   */
  async receive(mail: InboundMailPayload): Promise<void> {
    const orderId = CANCEL_REQUEST.exec(mail.text)?.[1];
    if (!orderId) return;
    const { dkim, spf } = mail.authentication;
    if (dkim !== MailAuthResult.Pass || spf !== MailAuthResult.Pass) return;
    const customer = await this.identity.principalByVerifiedEmail(mail.fromAddress);
    if (!customer || customer.email.toLowerCase() !== mail.fromAddress.toLowerCase()) return;
    await this.commerce.order.cancel.queue({ orderId }, { onBehalfOf: customer.id });
  }
}
