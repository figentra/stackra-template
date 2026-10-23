/**
 * Stackra file contract:
 * Purpose: proves each safeguard of the inbound cancel: a bad signature is refused before any field
 *          is parsed, and a platform-signed event replayed to a tenant connection's URL is refused;
 *          a spoofed `From` with SPF and DKIM passing for the attacker's own domain (DMARC fail),
 *          a sender that is not exactly a verified customer address, and an aligned pass that
 *          arrived on a tenant connection's inbox all queue nothing; an aligned DMARC pass on the
 *          platform inbox queues the cancel on behalf of that customer.
 * Boundary: unit tier; Resend's `email.received` webhook is delivered with `deliverWebhook` to the
 *           platform account's URL or to a tenant connection's URL, signed with a test secret or
 *           not; the received-email read goes to a fake of the Resend integration's managed client;
 *           the listener runs when the inbox is drained; the commerce client is the one fake shape,
 *           asserted by the action class; identity is faked with one verified address; the signing
 *           secrets are test values in the testing secret and connection stores, never production
 *           values.
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
import { CancelOrderAction, CommerceClient } from "#stackra/clients/commerce";
import { NotificationsModule } from "#stackra/module";
import { ResendConnection } from "#modules/messages/connections/resend.connection";
import { MailAuthResult } from "#modules/messages/enums/mail-auth-result.enum";
import { InboundMailReceived } from "#modules/messages/events/inbound-mail-received.event";
import { ResendIntegration } from "#modules/messages/integrations/resend.integration";
import { CancelFromMailListener } from "#modules/messages/listeners/cancel-from-mail.listener";
import { MailAuthentication } from "#modules/messages/schemas/mail-authentication.schema";

/** The platform's test signing secret, under the name ResendIntegration declares. */
const SECRET = "test-signing-secret";

/** A tenant connection's own test signing secret. */
const TENANT_SECRET = "test-tenant-signing-secret";

/** The id of the tenant's Resend connection, the `:connectionId` of its webhook URL. */
const TENANT_CONNECTION = "conn_00000000000000000000000001";

/** The customer's verified address; the only sender allowed to act for them. */
const ADDRESS = "customer@acme.example";

/** A commerce order id: this service has no factory for another service's records. */
const ORDER_ID = "ord_00000000000000000000000001";

/** SPF, DKIM and DMARC all pass: the `From` domain aligns with a passing identifier. */
const ALIGNED = MailAuthentication.create({
  spf: MailAuthResult.Pass,
  dkim: MailAuthResult.Pass,
  dmarc: MailAuthResult.Pass,
});

/**
 * Mail sent from attacker.example's own servers and signed with its own key, with
 * `From: customer@acme.example`: SPF and DKIM pass for attacker.example, DMARC fails because
 * neither identifier aligns with acme.example.
 */
const SPOOFED = MailAuthentication.create({
  spf: MailAuthResult.Pass,
  dkim: MailAuthResult.Pass,
  dmarc: MailAuthResult.Fail,
});

/** One received mail as Resend's API returns it. */
interface StoredMail {
  readonly from: string;
  readonly authentication: MailAuthentication;
}

/**
 * A booted service with one verified customer, a fake Resend inbox, a tenant Resend connection
 * with its own signing secret, and a webhook builder.
 */
async function setup(stored: StoredMail = { from: ADDRESS, authentication: ALIGNED }) {
  const customer = actors.customer();
  const commerce = fakeClient();
  const resend = fakeIntegrationApi(ResendIntegration, (api) =>
    api.get("/emails/receiving/:id").returns(({ id }) => ({
      id,
      from: stored.from,
      text: `CANCEL ${ORDER_ID} please`,
      authentication: stored.authentication,
    })),
  );
  await createTestingModule(NotificationsModule)
    .useDrivers("memory")
    .withSecrets({ RESEND_WEBHOOK_SECRET: SECRET })
    .withIntegrationApi(ResendIntegration, resend)
    .withConnection(ResendConnection, {
      id: TENANT_CONNECTION,
      fields: {
        apiKey: "re_test_tenant_key",
        fromAddress: "orders@shop.acme.example",
        webhookSecret: TENANT_SECRET,
      },
    })
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
    expect(commerce.queued(CancelOrderAction)).toEqual([]);
  });

  /** Safeguard a: a connection's URL never falls back to the platform secret. */
  it("refuses a platform-signed event replayed to a tenant connection's URL", async () => {
    const { commerce, webhook } = await setup();

    const result = await deliverWebhook(InboundMailReceived, webhook(), {
      secret: SECRET,
      connectionId: TENANT_CONNECTION,
    });
    await drainOutbox();

    expect(result).toRefuseWith(refusal(InvalidSignatureError));
    expect(commerce.queued(CancelOrderAction)).toEqual([]);
  });

  /** Safeguard b: SPF and DKIM passing for the attacker's own domain never bind `From`. */
  it("queues nothing for a spoofed From without a DMARC pass", async () => {
    const { commerce, webhook } = await setup({ from: ADDRESS, authentication: SPOOFED });

    const result = await deliverWebhook(InboundMailReceived, webhook(), { secret: SECRET });
    await drainOutbox();

    expect(result).toMatchObject({ ok: true });
    expect(commerce.queued(CancelOrderAction)).toEqual([]);
  });

  /** Safeguard b: an address that is not exactly the verified one does nothing. */
  it("queues nothing for a sender that is not a verified customer address", async () => {
    const { commerce, webhook } = await setup({
      from: "other@acme.example",
      authentication: ALIGNED,
    });

    await deliverWebhook(InboundMailReceived, webhook(), { secret: SECRET });
    await drainOutbox();

    expect(commerce.queued(CancelOrderAction)).toEqual([]);
  });

  /** Only the platform inbox speaks for a customer; a tenant-controlled inbox never does. */
  it("queues nothing for an aligned pass that arrived on a tenant connection's inbox", async () => {
    const { commerce, webhook } = await setup();

    const result = await deliverWebhook(InboundMailReceived, webhook(), {
      secret: TENANT_SECRET,
      connectionId: TENANT_CONNECTION,
    });
    await drainOutbox();

    expect(result).toMatchObject({ ok: true });
    expect(commerce.queued(CancelOrderAction)).toEqual([]);
  });

  /** Safeguard c: an aligned pass on the platform inbox queues the cancel as that customer. */
  it("queues the cancel on behalf of the verified customer", async () => {
    const { customer, commerce, webhook } = await setup();

    const result = await deliverWebhook(InboundMailReceived, webhook(), { secret: SECRET });
    await drainOutbox();

    expect(result).toMatchObject({ ok: true });
    expect(commerce.queued(CancelOrderAction)).toEqual([
      { input: { orderId: ORDER_ID }, onBehalfOf: customer.id },
    ]);
  });
});
