/**
 * Stackra file contract:
 * Purpose: the production mail transport over Resend's API, with the tenant's own connection when
 *          it has one and the platform key otherwise.
 * Boundary: implements the MailTransport port of @stackra/notifications and is named by its file
 *           prefix (`resend`). It translates a provider failure into the retryable
 *           MailProviderUnavailableError, so the delivery job retries (ADR 0140). The wiring loads
 *           it lazily, so the SDK never loads when `memory` is selected. Credentials come from the
 *           connection store or the secret store, never from a file.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 16 and 17), ADR 0142, ADR 0140, ADR 0173 (secrets
 *                     by reference), ADR 0266
 */
import type { ConnectionStore } from "@stackra/connections";
import { Driver } from "@stackra/container";
import { MailTransport, type OutboundMail } from "@stackra/notifications/contracts";
import { Resend } from "resend";
import type { DeliveryConfig } from "#config/delivery.config";
import { ResendConnection } from "#modules/messages/connections/resend.connection";
import { MailProviderUnavailableError } from "#modules/messages/errors/mail-provider-unavailable.error";

/** Resend deduplicates on the `Idempotency-Key` header, so a retried job never sends twice. */
export class ResendMailTransportDriver extends Driver(MailTransport) {
  /**
   * @param config - the resolved config; `resendApiKey` is the platform secret, never logged.
   * @param connections - the current tenant's connections; `find` returns null when none is set.
   */
  constructor(
    private readonly config: DeliveryConfig,
    private readonly connections: ConnectionStore,
  ) {
    super();
  }

  /**
   * Sends with the tenant's own key and sender when it has a Resend connection.
   * @throws MailProviderUnavailableError (retryable) on a transport or provider failure.
   */
  async send(mail: OutboundMail, idempotencyKey: string): Promise<string> {
    const own = await this.connections.find(ResendConnection);
    const client = new Resend(own?.apiKey ?? this.config.resendApiKey);
    const { data, error } = await client.emails.send(
      { ...mail, from: own?.fromAddress ?? mail.from },
      { idempotencyKey },
    );
    if (error || !data) {
      throw MailProviderUnavailableError.create(error ? { reason: error.name } : {});
    }
    return data.id;
  }
}
