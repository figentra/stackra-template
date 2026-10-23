/**
 * Stackra file contract:
 * Purpose: a customer replying "CANCEL <order id>" to their confirmation cancels that unpaid order
 *          through commerce's action, as a queued call.
 * Boundary: subscribed to InboundMailReceived (a webhook event of the Resend integration) by the
 *           type of the event parameter. Only the platform's own inbound address may assert the
 *           identity of a platform customer: an event that arrived on a tenant connection's URL
 *           (`ctx.connection` set) was verified against that tenant's secret and came through a
 *           Resend account the tenant controls, so it never speaks for a customer and returns
 *           before anything is read. For the platform inbox, Resend's webhook carries metadata
 *           only, so the listener reads the mail's text and authentication verdicts through the
 *           platform integration's managed client. Its three safeguards all hold before anything
 *           is queued: (a) the event's signature was verified against the platform secret before
 *           this class runs; (b) the sender acts for a customer only on a DMARC `pass`, which the
 *           receiving provider gives only when the `From` domain aligns (relaxed: the same
 *           organisational domain) with the DKIM `d=` domain or the SPF envelope MAIL FROM domain
 *           that passed, plus an exact match of that `From` address with the customer's verified
 *           email; an SPF and DKIM pass without DMARC is refused, because both pass for an
 *           attacker's own domain while `From` names the victim; (c) the cancel runs `onBehalfOf`
 *           the customer, so commerce's OrderPolicy#cancel decides as them (own orders, unpaid
 *           only), and commerce access-logs every such cancel. Anything else returns without
 *           queueing: the mail was accepted and is dropped.
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
import type { MailAuthentication } from "#modules/messages/schemas/mail-authentication.schema";
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

  /** Queues the cancel only when the platform inbox received it and the sender is proven. */
  async handle(event: InboundMailReceived, ctx: ListenerContext): Promise<void> {
    if (ctx.connection) return; // a tenant's inbox never asserts a platform customer's identity
    const mail = await this.resend.api.get<ResendReceivedEmail>(
      `/emails/receiving/${event.data.email_id}`,
    );
    const orderId = CANCEL_REQUEST.exec(mail.text ?? "")?.[1];
    if (!orderId || !this.isAligned(mail.authentication)) return;
    const customer = await this.identity.principalByVerifiedEmail(mail.from);
    if (!customer || customer.email.toLowerCase() !== mail.from.toLowerCase()) return;
    await this.commerce.order.cancel.queue({ orderId }, { onBehalfOf: customer.id });
  }

  /**
   * DMARC `pass` is the provider's verdict that an aligned identifier passed; a pass with neither
   * SPF nor DKIM passing contradicts itself and is refused as well.
   */
  private isAligned(auth: MailAuthentication | null): boolean {
    if (auth?.dmarc !== MailAuthResult.Pass) return false;
    return auth.dkim === MailAuthResult.Pass || auth.spf === MailAuthResult.Pass;
  }
}
