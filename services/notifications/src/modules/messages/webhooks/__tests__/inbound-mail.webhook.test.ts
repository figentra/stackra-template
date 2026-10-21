/**
 * Stackra file contract:
 * Purpose: proves each ADR 0207 safeguard of the inbound-cancel receiver: a bad signature is
 *          refused before parsing; a DKIM or SPF failure, or a sender that is not exactly a
 *          verified customer address, queues nothing; a proven sender queues the cancel on behalf
 *          of that customer.
 * Boundary: unit tier; the receiver is invoked with `deliverWebhook` (signed or not); the commerce
 *           client is faked by class; identity is faked with one verified address.
 * Runtime: node
 * Governing contract: ADR 0082, ADR 0260 d4, ADR 0022, ADR 0207
 */
import { describe, expect, it } from "@stackra/testing";
import { actors } from "@stackra/iam/testing";
import { refusal } from "@stackra/errors/testing";
import { createTestingModule } from "@stackra/container/testing";
import { fakeClient } from "@stackra/clients/testing";
import { IdentityResolver } from "@stackra/contracts";
import { fakeIdentity } from "@stackra/identity/testing";
import { deliverWebhook } from "@stackra/webhooks/testing";
import { CommerceClient } from "#stackra/clients";
import { Refusals } from "#stackra/manifest";
import { NotificationsConfig } from "#config/notifications.config";
import { NotificationsModule } from "#src/notifications.module";
import { InboundMailWebhook } from "#modules/messages/webhooks/inbound-mail.webhook";
import { MailAuthResult } from "#modules/messages/enums/mail-auth-result.enum";

/** Test signing secret; set through config like the real one, never a production value. */
const SECRET = "test-signing-secret";
/** The customer's verified address; the only sender allowed to act for them. */
const ADDRESS = "customer@example.test";
/** A commerce order id: this service has no factory for another service's records. */
const ORDER_ID = "ord_00000000000000000000000001";

/** A booted receiver with one verified customer, and a payload builder. */
async function setup() {
  const customer = actors.customer();
  const commerce = fakeClient(CommerceClient);
  await createTestingModule(NotificationsModule)
    .useDrivers("memory")
    .withConfig(NotificationsConfig, { inboundSigningSecret: SECRET })
    .override(CommerceClient, commerce)
    .override(IdentityResolver, fakeIdentity({ [customer.id]: { email: ADDRESS, locale: "en" } }))
    .compile();
  const mail = (fromAddress = ADDRESS, auth = MailAuthResult.Pass) => ({
    fromAddress,
    subject: "Re: your order",
    text: `CANCEL ${ORDER_ID} please`,
    authentication: { dkim: auth.value, spf: MailAuthResult.Pass.value },
  });
  return { customer, commerce, mail };
}

/** Guards the public inbound-mail endpoint, which may cancel a customer's order. */
describe(InboundMailWebhook, () => {
  /** Safeguard a: an unsigned or wrongly signed body is refused before any parsing. */
  it("refuses a bad signature", async () => {
    const { commerce, mail } = await setup();

    const result = await deliverWebhook(InboundMailWebhook, mail(), { secret: "wrong" });

    expect(result).toRefuseWith(refusal(Refusals.webhooks.invalid_signature));
    expect(commerce.queued(commerce.order.cancel)).toEqual([]);
  });

  /**
   * Safeguard b: a DKIM failure, or an address that is not exactly the verified one, does nothing.
   */
  it("queues nothing without DKIM and SPF passes and an exact verified address", async () => {
    const { commerce, mail } = await setup();

    await deliverWebhook(InboundMailWebhook, mail(ADDRESS, MailAuthResult.Fail), {
      secret: SECRET,
    });
    await deliverWebhook(InboundMailWebhook, mail("other@example.test"), { secret: SECRET });

    expect(commerce.queued(commerce.order.cancel)).toEqual([]);
  });

  /** Safeguard c: a proven sender queues the cancel on behalf of exactly that customer. */
  it("queues the cancel on behalf of the verified customer", async () => {
    const { customer, commerce, mail } = await setup();

    const result = await deliverWebhook(InboundMailWebhook, mail(), { secret: SECRET });

    expect(result).toMatchObject({ ok: true });
    expect(commerce.queued(commerce.order.cancel)).toEqual([
      { input: { orderId: ORDER_ID }, onBehalfOf: customer.id },
    ]);
  });
});
