/**
 * Stackra file contract:
 * Purpose: the memory mail transport: keeps sent mails in a list for dev and tests
 *          (`transport: memory`, the config default).
 * Boundary: implements the MailTransport port of @stackra/notifications and is named by its file
 *           prefix (`memory`). The memory driver ships before the production one (ADR 0266);
 *           `sent()` is what tests assert on. One instance per container.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 16 and 17), ADR 0266 d2 (memory driver first)
 */
import { Driver } from "@stackra/container";
import { MailTransport, type OutboundMail } from "@stackra/notifications/contracts";

/** Ids are `mem_<n>`; a repeated idempotency key returns the first id, as the provider would. */
export class MemoryMailTransportDriver extends Driver(MailTransport) {
  /** Keyed by idempotency key, so a repeated send returns the first id. */
  private readonly mails = new Map<string, { id: string; mail: OutboundMail }>();

  /** Keeps the mail and returns its id; a repeated key returns the first id and keeps nothing. */
  async send(mail: OutboundMail, idempotencyKey: string): Promise<string> {
    const existing = this.mails.get(idempotencyKey);
    if (existing) return existing.id;
    const id = `mem_${this.mails.size + 1}`;
    this.mails.set(idempotencyKey, { id, mail });
    return id;
  }

  /** Every mail sent, in order. */
  sent(): readonly OutboundMail[] {
    return [...this.mails.values()].map((entry) => entry.mail);
  }
}
