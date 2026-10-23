/**
 * Stackra file contract:
 * Purpose: the production mail transport over Resend's API, with the tenant's own connection when
 *          it has one and the platform integration otherwise.
 * Boundary: implements the MailTransport port of @stackra/notifications (`Driver(MailTransport)`:
 *           the port is a value argument because the driver inherits its abstract members) and is
 *           named by its file prefix (`resend`). One code path for both credentials: the tenant's
 *           ResendConnection and the platform's ResendIntegration expose the same managed client,
 *           which applies the API key, the egress allowlist, Resend's rate limit and the retries (a
 *           POST retries only because the idempotency key is passed). After its last retry the
 *           client throws the retryable ProviderUnavailableError, so the delivery job retries and
 *           finally dead-letters; a non-retryable 4xx is ProviderRefusedError. No SDK and no key in
 *           this file: credentials come from the connection store or the secret store. The wiring
 *           loads it lazily, so it never loads when `memory` is selected.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 16 and 17, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0142, ADR 0140, ADR 0218, ADR 0266
 */
import { Driver } from "@stackra/container";
import type { ConnectionStore } from "@stackra/integrations";
import { MailTransport, type OutboundMail } from "@stackra/notifications/contracts";
import { ResendConnection } from "#modules/messages/connections/resend.connection";
import type { ResendIntegration } from "#modules/messages/integrations/resend.integration";
import type { ResendSendResult } from "#modules/messages/schemas/resend-send-result.schema";

/** Resend deduplicates on the `Idempotency-Key` header, so a retried job never sends twice. */
export class ResendMailTransportDriver extends Driver(MailTransport) {
  /**
   * @param resend - the platform integration; its client authenticates with the platform key.
   * @param connections - the current tenant's connections; `find` returns null when none is set.
   */
  constructor(
    private readonly resend: ResendIntegration,
    private readonly connections: ConnectionStore,
  ) {
    super();
  }

  /**
   * Sends with the tenant's own key and sender when it has a Resend connection.
   * @throws ProviderUnavailableError (retryable) once the managed client's retries are spent.
   */
  async send(mail: OutboundMail, idempotencyKey: string): Promise<string> {
    const own = await this.connections.find(ResendConnection);
    const api = own?.api ?? this.resend.api;
    const sent = await api.post<ResendSendResult>(
      "/emails",
      { ...mail, from: own?.fromAddress ?? mail.from },
      { idempotencyKey },
    );
    return sent.id;
  }
}
