/**
 * Stackra file contract:
 * Purpose: the production transport over Resend's API, with the tenant's own connection when it has
 *          one and the platform key otherwise.
 * Boundary: implements the port only; translates the provider's failure into a retryable AppError
 *           so the delivery job retries (ADR 0140). Lazy-loaded by the wiring, so the SDK never
 *           loads when `memory` is selected. Credentials come from the connection store or the
 *           secret store, never from a file.
 * Runtime: node
 * Governing contract: ADR 0142, 0140, 0173 (secrets by reference), ADR 0266; ADR 0127
 */
import type { ConnectionStore } from "@stackra/connections";
import { Driver } from "@stackra/container";
import { Resend } from "resend";
import type { NotificationsConfig } from "#config/notifications.config";
import { MailTransport, type OutboundMail } from "#modules/messages/contracts/mail-transport.port";
import { ResendConnection } from "#modules/messages/connections/resend.connection";
import { MailProviderUnavailableError } from "#modules/messages/errors/mail-provider-unavailable.error";

/** Resend deduplicates on the `Idempotency-Key` header, so a retried job never sends twice. */
@Driver(MailTransport, "resend")
export class ResendMailTransport extends MailTransport {
  /**
   * @param config - the resolved config; `resendApiKey` is the platform secret, never logged.
   * @param connections - the current tenant's connections; `find` returns null when none is set.
   */
  constructor(
    private readonly config: NotificationsConfig,
    private readonly connections: ConnectionStore,
  ) {
    super();
  }

  /**
   * Sends with the tenant's own key and sender when it has a Resend connection.
   * @throws MailProviderUnavailableError (retryable) on a transport or 5xx failure.
   */
  async send(mail: OutboundMail, idempotencyKey: string): Promise<string> {
    const own = await this.connections.find(ResendConnection);
    const client = new Resend(own?.apiKey ?? this.config.resendApiKey);
    const { data, error } = await client.emails.send(
      { ...mail, from: own?.fromAddress ?? mail.from },
      { idempotencyKey },
    );
    if (error || !data) throw new MailProviderUnavailableError(error?.name);
    return data.id;
  }
}
