/**
 * Stackra file contract:
 * Purpose: the `messages.resend` connection: a tenant's own Resend key and sender, so its mail
 *          leaves from its own domain instead of the platform's.
 * Boundary: a Connection is the shape of one stored credential set, bound to ResendIntegration by
 *           its type argument and its stem (`Connection<ResendIntegration>`), never by a value
 *           passed in; its key is the integration's (`messages.resend`). Its `@Secret` fields are
 *           tenant secrets: kept per tenant in the connection store, envelope-encrypted, never
 *           synced by runway, read back to a screen or logged; the console's connection form is
 *           generated from the fields and writes them. `check()` runs at connect (nothing is stored
 *           if it throws), from the console's Test button and on the integration's health schedule.
 *           A sending-only key is accepted and encouraged (least privilege); delivery webhooks need
 *           the signing secret pasted from Resend's dashboard. Without a connection, the platform's
 *           key on ResendIntegration and the sender from DeliveryConfig apply.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 3, 4, 13, 19 and 20, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0107, ADR 0173 (secrets), ADR 0231 (secret names)
 */
import { Secret } from "@stackra/config";
import type { Email } from "@stackra/contracts";
import {
  ConnectedAccount,
  Connection,
  ConnectionCheckFailedError,
  ProviderRefusedError,
} from "@stackra/integrations";
import type { ResendIntegration } from "#modules/messages/integrations/resend.integration";
import type { ResendDomainList } from "#modules/messages/schemas/resend-domain-list.schema";

/** One per tenant at most; ResendMailTransportDriver looks it up for the current tenant. */
export class ResendConnection extends Connection<ResendIntegration> {
  /** The tenant's Resend API key; write-only in the console. */
  @Secret("RESEND_TENANT_API_KEY")
  apiKey!: string;

  /** The verified From address on the tenant's own domain. */
  fromAddress!: Email;

  /**
   * The signing secret of the tenant's Resend webhooks; without it no inbound event is accepted.
   */
  @Secret("RESEND_TENANT_WEBHOOK_SECRET")
  webhookSecret?: string;

  /**
   * A full-access key must own a verified domain for `fromAddress`. A sending-only key answers 401
   * `restricted_api_key` on the domain list: that proves the key is valid, so the check passes on
   * the sender domain alone (Resend refuses an unverified sender at send time).
   * @throws ConnectionCheckFailedError `sender_domain_unverified` when the key's account has no
   *         verified domain for the sender; a rejected key surfaces as ReauthorizationRequiredError
   *         from the managed client.
   */
  async check(): Promise<ConnectedAccount> {
    const domain = this.fromAddress.slice(this.fromAddress.lastIndexOf("@") + 1);
    try {
      const domains = await this.api.get<ResendDomainList>("/domains");
      const own = domains.data.find((candidate) => candidate.name === domain);
      if (own?.status !== "verified") {
        throw ConnectionCheckFailedError.create({ reason: "sender_domain_unverified" });
      }
    } catch (error) {
      if (!ProviderRefusedError.is(error, { status: 401, code: "restricted_api_key" })) throw error;
    }
    return ConnectedAccount.from({ id: domain, label: domain });
  }
}
