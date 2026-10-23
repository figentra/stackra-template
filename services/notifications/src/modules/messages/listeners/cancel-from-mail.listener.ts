/**
 * Stackra file contract:
 * Purpose: a customer replying "CANCEL <order id>" to their confirmation cancels that unpaid order
 *          through commerce's action, as a queued call.
 * Boundary: subscribed to InboundMailReceived (a webhook event) by the type of the event parameter.
 *           Its three safeguards all hold before anything is queued: (a) the event's signature was
 *           verified before this class runs; (b) the sender acts for a customer only on a DKIM and
 *           SPF pass plus an exact match with that customer's verified email; (c) the cancel runs
 *           `onBehalfOf` the customer, so commerce's OrderPolicy#cancel decides as them (own
 *           orders, unpaid only), and commerce access-logs every such cancel. Anything else returns
 *           without queueing: the mail was accepted and is dropped.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 5 and 16), ADR 0082 (areas), ADR 0260 d4 (queued
 *                     calls)
 */
import type { IdentityResolver } from "@stackra/contracts";
import { Listener } from "@stackra/events";
import { Commerce, type CommerceClient } from "#stackra/clients";
import { MailAuthResult } from "#modules/messages/enums/mail-auth-result.enum";
import type { InboundMailReceived } from "#modules/messages/events/inbound-mail-received.event";

/** "CANCEL" then one commerce order id, built from the id prefix in commerce's manifest. */
const CANCEL_REQUEST = new RegExp(
  `^\\s*CANCEL\\s+(${Commerce.publicIds.Order}_[a-z0-9]{26})\\b`,
  "i",
);

/** The command reach of the template: a queued call into commerce on behalf of a customer. */
export class CancelFromMailListener extends Listener {
  /**
   * @param commerce - the generated client; `order.cancel.queue` is a queued call.
   * @param identity - finds the principal whose verified address sent the mail.
   */
  constructor(
    private readonly commerce: CommerceClient,
    private readonly identity: IdentityResolver,
  ) {
    super();
  }

  /** Queues the cancel only when the sender is proven to be the customer. */
  async handle(event: InboundMailReceived): Promise<void> {
    const orderId = CANCEL_REQUEST.exec(event.text)?.[1];
    if (!orderId) return;
    const { dkim, spf } = event.authentication;
    if (dkim !== MailAuthResult.Pass || spf !== MailAuthResult.Pass) return;
    const customer = await this.identity.principalByVerifiedEmail(event.fromAddress);
    if (!customer || customer.email.toLowerCase() !== event.fromAddress.toLowerCase()) return;
    await this.commerce.order.cancel.queue({ orderId }, { onBehalfOf: customer.id });
  }
}
