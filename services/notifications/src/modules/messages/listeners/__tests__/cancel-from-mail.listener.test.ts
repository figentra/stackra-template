/**
 * Stackra file contract:
 * Purpose: proves each safeguard of the inbound cancel: a bad signature is refused before any
 *          field is parsed; a DKIM or SPF failure, or a sender that is not exactly a verified
 *          customer address, queues nothing; a proven sender queues the cancel on behalf of that
 *          customer.
 * Boundary: unit tier; the webhook event is delivered with `deliverWebhook` (signed with the test
 *           secret or not), the listener runs when the inbox is drained; the commerce client is
 *           faked by class; identity is faked with one verified address; the signing secret is set
 *           in the testing secret store, never a production value.
 * Runtime: node
 * Governing contract: ADR 0082, ADR 0260 d4, ADR 0022
 */
import { fakeClient } from "@stackra/clients/testing";
import { createTestingModule } from "@stackra/container/testing";
import { IdentityResolver } from "@stackra/contracts";
import { refusal } from "@stackra/errors/testing";
import { drainOutbox } from "@stackra/events/testing";
import { actors } from "@stackra/iam/testing";
import { fakeIdentity } from "@stackra/identity/testing";
import { describe, expect, it } from "@stackra/testing";
import { deliverWebhook } from "@stackra/webhooks/testing";
import { CommerceClient } from "#stackra/clients";
import { Refusals } from "#stackra/manifest";
import { NotificationsModule } from "#src/notifications.module";
import { MailAuthResult } from "#modules/messages/enums/mail-auth-result.enum";
import { InboundMailReceived } from "#modules/messages/events/inbound-mail-received.event";
import { CancelFromMailListener } from "#modules/messages/listeners/cancel-from-mail.listener";

/** The test signing secret, under the name the event declares. */
const SECRET = "test-signing-secret";

/** The customer's verified address; the only sender allowed to act for them. */
const ADDRESS = "customer@acme.example";

/** A commerce order id: this service has no factory for another service's records. */
const ORDER_ID = "ord_00000000000000000000000001";

/** A booted service with one verified customer, and a payload builder. */
async function setup() {
  const customer = actors.customer();
  const commerce = fakeClient(CommerceClient);
  await createTestingModule(NotificationsModule)
    .useDrivers("memory")
    .withSecrets({ RESEND_INBOUND_SIGNING_SECRET: SECRET })
    .override(CommerceClient, commerce)
    .override(IdentityResolver, fakeIdentity({ [customer.id]: { email: ADDRESS, locale: "en" } }))
    .compile();
  const mail = (fromAddress = ADDRESS, dkim: MailAuthResult = MailAuthResult.Pass) => ({
    fromAddress,
    subject: "Re: your order",
    text: `CANCEL ${ORDER_ID} please`,
    authentication: { dkim, spf: MailAuthResult.Pass },
  });
  return { customer, commerce, mail };
}

/** Guards the public inbound-mail endpoint, which may cancel a customer's order. */
describe(CancelFromMailListener, () => {
  /** Safeguard a: an unsigned or wrongly signed body is refused before any parsing. */
  it("refuses a bad signature", async () => {
    const { commerce, mail } = await setup();

    const result = await deliverWebhook(InboundMailReceived, mail(), { secret: "wrong" });
    await drainOutbox();

    expect(result).toRefuseWith(refusal(Refusals.webhooks.invalid_signature));
    expect(commerce.queued(commerce.order.cancel)).toEqual([]);
  });

  /**
   * Safeguard b: a DKIM failure, or an address that is not exactly the verified one, does nothing.
   */
  it("queues nothing without DKIM and SPF passes and an exact verified address", async () => {
    const { commerce, mail } = await setup();

    await deliverWebhook(InboundMailReceived, mail(ADDRESS, MailAuthResult.Fail), {
      secret: SECRET,
    });
    await deliverWebhook(InboundMailReceived, mail("other@acme.example"), { secret: SECRET });
    await drainOutbox();

    expect(commerce.queued(commerce.order.cancel)).toEqual([]);
  });

  /** Safeguard c: a proven sender queues the cancel on behalf of exactly that customer. */
  it("queues the cancel on behalf of the verified customer", async () => {
    const { customer, commerce, mail } = await setup();

    const result = await deliverWebhook(InboundMailReceived, mail(), { secret: SECRET });
    await drainOutbox();

    expect(result).toMatchObject({ ok: true });
    expect(commerce.queued(commerce.order.cancel)).toEqual([
      { input: { orderId: ORDER_ID }, onBehalfOf: customer.id },
    ]);
  });
});
