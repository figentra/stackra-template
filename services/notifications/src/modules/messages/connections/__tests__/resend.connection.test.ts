/**
 * Stackra file contract:
 * Purpose: proves ResendConnection#check: a full-access key with a verified sender domain passes
 *          and names the domain; an unverified domain refuses with `sender_domain_unverified`; a
 *          sending-only key (401 `restricted_api_key` on the domain list) passes on the sender
 *          domain alone.
 * Boundary: unit tier; the connection is built with `makeConnection` over a fake of the
 *           integration's managed client, so no request leaves the process and no secret is read.
 * Runtime: node
 * Governing contract: ADR 0107, ADR 0218, ADR 0022
 */
import { ProviderRefusedError } from "@stackra/integrations";
import { fakeIntegrationApi, makeConnection } from "@stackra/integrations/testing";
import { describe, expect, it } from "@stackra/testing";
import { ResendConnection } from "#modules/messages/connections/resend.connection";
import { ResendIntegration } from "#modules/messages/integrations/resend.integration";

/**
 * A tenant connection sending from `orders@shop.acme.example` over the given domain-list answer.
 */
function connectionWith(domains: () => unknown) {
  const api = fakeIntegrationApi(ResendIntegration, (fake) =>
    fake.get("/domains").returns(domains),
  );
  return makeConnection(ResendConnection, {
    api,
    fields: {
      apiKey: "re_test_key",
      fromAddress: "orders@shop.acme.example",
      webhookSecret: "test-tenant-signing-secret",
    },
  });
}

/** Guards the connect-time test: a wrong key or sender must fail before anything is stored. */
describe(ResendConnection, () => {
  /** A verified domain for the sender: the account label is the domain. */
  it("passes and names the verified sender domain", async () => {
    const connection = connectionWith(() => ({
      data: [{ id: "d_1", name: "shop.acme.example", status: "verified" }],
    }));

    await expect(connection.check()).resolves.toMatchObject({
      id: "shop.acme.example",
      label: "shop.acme.example",
    });
  });

  /** The domain exists but its DNS records are not verified yet. */
  it("refuses an unverified sender domain", async () => {
    const connection = connectionWith(() => ({
      data: [{ id: "d_1", name: "shop.acme.example", status: "pending" }],
    }));

    await expect(connection.check()).rejects.toMatchObject({ reason: "sender_domain_unverified" });
  });

  /** A sending-only key cannot list domains; the 401 proves the key itself is valid. */
  it("passes a sending-only key on the sender domain alone", async () => {
    const connection = connectionWith(() => {
      throw ProviderRefusedError.create({ status: 401, code: "restricted_api_key" });
    });

    await expect(connection.check()).resolves.toMatchObject({ id: "shop.acme.example" });
  });
});
