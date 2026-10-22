/**
 * Stackra file contract:
 * Purpose: the memory transport: keeps sent mails in a list for dev and tests (`transport:
 *          memory`).
 * Boundary: the memory driver that ships before the production driver (ADR 0266); `sent` is what
 *           tests assert on.
 * Runtime: node
 * Governing contract: ADR 0266 d2
 */
import { Driver } from "@stackra/container";
import { MailTransport, type OutboundMail } from "#modules/messages/contracts/mail-transport.port";

/** One instance per container; ids are `mem_<n>`. */
@Driver(MailTransport, "memory")
export class MemoryMailTransport extends MailTransport {
  /** Keyed by idempotency key, so a repeated send returns the first id. */
  private readonly mails = new Map<string, { id: string; mail: OutboundMail }>();

  /** Keeps the mail; a repeated key returns the first id, as the provider would. */
  async send(mail: OutboundMail, idempotencyKey: string): Promise<string> {
    const existing = this.mails.get(idempotencyKey);
    if (existing) return existing.id;
    const id = `mem_${this.mails.size + 1}`;
    this.mails.set(idempotencyKey, { id, mail });
    return id;
  }

  /** Every mail sent, in order. */
  sent(): readonly OutboundMail[] {
    return [...this.mails.values()].map((m) => m.mail);
  }
}
