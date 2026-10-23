/**
 * Stackra file contract:
 * Purpose: a customer replying "CANCEL <order id>" to their confirmation cancels that unpaid order
 *          through commerce's action, as a queued call.
 * Boundary: subscribed to InboundMailReceived (a webhook event of the Resend integration) by the
 *           type of the event parameter. Resend's webhook carries metadata only, so the listener
 *           reads the mail's text and authentication results through the managed client of the
 *           connection the webhook arrived on, or of the platform integration for the platform's
 *           own inbound address. Its three safeguards all hold before anything is queued: (a) the
 *           event's signature was verified before this class runs; (b) the sender acts for a
 *           customer only on a DKIM and SPF pass computed by the receiving server, plus an exact
 *           match with that customer's verified email; (c) the cancel runs `onBehalfOf` the
 *           customer, so commerce's OrderPolicy#cancel decides as them (own orders, unpaid only),
 *           and commerce access-logs every such cancel. Anything else returns without queueing: the
 *           mail was accepted and is dropped.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 5 and 16, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0082 (areas), ADR 0224, ADR 0260 d4 (queued calls)
 */
import type { IdentityResolver } from "@stackra/contracts";
import { Listener, type ListenerContext } from "@stackra/events";
import type { CommerceClient } from "#stackra/clients/commerce";
import { CANCEL_REQUEST } from "#modules/messages/constants/cancel-request.constant";
import { MailAuthResult } from "#modules/messages/enums/mail-auth-result.enum";
import type { InboundMailReceived } from "#modules/messages/events/inbound-mail-received.event";
import type { ResendIntegration } from "#modules/messages/integrations/resend.integration";
import type { ResendReceivedEmail } from "#modules/messages/schemas/resend-received-email.schema";

/** The command reach of the template: a queued call into commerce on behalf of a customer. */
export class CancelFromMailListener extends Listener {
  /**
   * @param commerce - the generated client; `order.cancel.queue` is a queued call.
   * @param identity - finds the principal whose verified address sent the mail.
   * @param resend - the platform integration, whose managed client reads the platform's inbox.
   */
  constructor(
    private readonly commerce: CommerceClient,
    private readonly identity: IdentityResolver,
    private readonly resend: ResendIntegration,
  ) {
    super();
  }

  /** Queues the cancel only when the sender is proven to be the customer. */
  async handle(event: InboundMailReceived, ctx: ListenerContext): Promise<void> {
    const api = ctx.connection?.api ?? this.resend.api;
    const mail = await api.get<ResendReceivedEmail>(`/emails/receiving/${event.data.email_id}`);
    const orderId = CANCEL_REQUEST.exec(mail.text ?? "")?.[1];
    if (!orderId) return;
    const auth = mail.authentication;
    if (auth?.dkim !== MailAuthResult.Pass || auth.spf !== MailAuthResult.Pass) return;
    const customer = await this.identity.principalByVerifiedEmail(mail.from);
    if (!customer || customer.email.toLowerCase() !== mail.from.toLowerCase()) return;
    await this.commerce.order.cancel.queue({ orderId }, { onBehalfOf: customer.id });
  }
}
