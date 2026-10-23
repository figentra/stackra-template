/**
 * Stackra file contract:
 * Purpose: proves each safeguard of the inbound cancel: a bad signature is refused before any field
 *          is parsed; a DKIM or SPF failure, or a sender that is not exactly a verified customer
 *          address, queues nothing; a proven sender queues the cancel on behalf of that customer.
 * Boundary: unit tier; Resend's `email.received` webhook is delivered with `deliverWebhook` to the
 *           platform account's URL, signed with the test secret or not; the received-email read
 *           goes to a fake of the Resend integration's managed client; the listener runs when the
 *           inbox is drained; the commerce client is faked by class; identity is faked with one
 *           verified address; the signing secret is set in the testing secret store, never a
 *           production value.
 * Runtime: node
 * Governing contract: ADR 0082, ADR 0224, ADR 0260 d4, ADR 0022
 */
import { fakeClient } from "@stackra/clients/testing";
import { createTestingModule } from "@stackra/container/testing";
import { IdentityResolver } from "@stackra/contracts";
import { refusal } from "@stackra/errors/testing";
import { drainOutbox } from "@stackra/events/testing";
import { actors } from "@stackra/iam/testing";
import { fakeIdentity } from "@stackra/identity/testing";
import { InvalidSignatureError } from "@stackra/integrations";
import { fakeIntegrationApi } from "@stackra/integrations/testing";
import { describe, expect, it } from "@stackra/testing";
import { deliverWebhook } from "@stackra/webhooks/testing";
import { CommerceClient } from "#stackra/clients/commerce";
import { NotificationsModule } from "#stackra/module";
import { MailAuthResult } from "#modules/messages/enums/mail-auth-result.enum";
import { InboundMailReceived } from "#modules/messages/events/inbound-mail-received.event";
import { ResendIntegration } from "#modules/messages/integrations/resend.integration";
import { CancelFromMailListener } from "#modules/messages/listeners/cancel-from-mail.listener";

/** The test signing secret, under the name ResendIntegration declares. */
const SECRET = "test-signing-secret";

/** The customer's verified address; the only sender allowed to act for them. */
const ADDRESS = "customer@acme.example";

/** A commerce order id: this service has no factory for another service's records. */
const ORDER_ID = "ord_00000000000000000000000001";

/** One received mail as Resend's API returns it. */
interface StoredMail {
  readonly from: string;
  readonly dkim: MailAuthResult;
}

/** A booted service with one verified customer, a fake Resend inbox, and a webhook builder. */
async function setup(stored: StoredMail = { from: ADDRESS, dkim: MailAuthResult.Pass }) {
  const customer = actors.customer();
  const commerce = fakeClient(CommerceClient);
  const resend = fakeIntegrationApi(ResendIntegration, (api) =>
    api.get("/emails/receiving/:id").returns(({ id }) => ({
      id,
      from: stored.from,
      text: `CANCEL ${ORDER_ID} please`,
      authentication: {
        spf: MailAuthResult.Pass,
        dkim: stored.dkim,
        dmarc: MailAuthResult.Pass,
      },
    })),
  );
  await createTestingModule(NotificationsModule)
    .useDrivers("memory")
    .withSecrets({ RESEND_WEBHOOK_SECRET: SECRET })
    .withIntegrationApi(ResendIntegration, resend)
    .override(CommerceClient, commerce)
    .override(IdentityResolver, fakeIdentity({ [customer.id]: { email: ADDRESS, locale: "en" } }))
    .compile();
  const webhook = () => ({
    type: "email.received",
    created_at: "2026-10-21T09:00:00Z",
    data: {
      email_id: "em_1",
      from: stored.from,
      to: ["orders@acme.example"],
      subject: "Re: order",
    },
  });
  return { customer, commerce, webhook };
}

/** Guards the public inbound-mail endpoint, which may cancel a customer's order. */
describe(CancelFromMailListener, () => {
  /** Safeguard a: an unsigned or wrongly signed body is refused before any parsing. */
  it("refuses a bad signature", async () => {
    const { commerce, webhook } = await setup();

    const result = await deliverWebhook(InboundMailReceived, webhook(), { secret: "wrong" });
    await drainOutbox();

    expect(result).toRefuseWith(refusal(InvalidSignatureError));
    expect(commerce.queued(commerce.order.cancel)).toEqual([]);
  });

  /** Safeguard b: a DKIM failure does nothing. */
  it("queues nothing without a DKIM pass", async () => {
    const { commerce, webhook } = await setup({ from: ADDRESS, dkim: MailAuthResult.Fail });

    await deliverWebhook(InboundMailReceived, webhook(), { secret: SECRET });
    await drainOutbox();

    expect(commerce.queued(commerce.order.cancel)).toEqual([]);
  });

  /** Safeguard b: an address that is not exactly the verified one does nothing. */
  it("queues nothing for a sender that is not a verified customer address", async () => {
    const { commerce, webhook } = await setup({
      from: "other@acme.example",
      dkim: MailAuthResult.Pass,
    });

    await deliverWebhook(InboundMailReceived, webhook(), { secret: SECRET });
    await drainOutbox();

    expect(commerce.queued(commerce.order.cancel)).toEqual([]);
  });

  /** Safeguard c: a proven sender queues the cancel on behalf of exactly that customer. */
  it("queues the cancel on behalf of the verified customer", async () => {
    const { customer, commerce, webhook } = await setup();

    const result = await deliverWebhook(InboundMailReceived, webhook(), { secret: SECRET });
    await drainOutbox();

    expect(result).toMatchObject({ ok: true });
    expect(commerce.queued(commerce.order.cancel)).toEqual([
      { input: { orderId: ORDER_ID }, onBehalfOf: customer.id },
    ]);
  });
});
