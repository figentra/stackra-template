/**
 * Stackra file contract:
 * Purpose: `MailAuthentication`: the provider's DKIM and SPF results for an inbound mail's sender.
 * Boundary: a shape class; the type of `InboundMailReceived.authentication`. A nested object is a
 *           named class in schemas/.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 13 and 26)
 */
import { Schema } from "@stackra/validation";
import type { MailAuthResult } from "#modules/messages/enums/mail-auth-result.enum";

/** Both must be `pass` before a mail may act for a customer. */
export class MailAuthentication extends Schema {
  /** The DKIM result. */
  dkim!: MailAuthResult;

  /** The SPF result. */
  spf!: MailAuthResult;
}
