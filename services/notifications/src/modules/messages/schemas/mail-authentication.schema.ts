/**
 * Stackra file contract:
 * Purpose: `MailAuthentication`: the SPF, DKIM and DMARC results Resend's receiving server computed
 *          for an inbound mail's sender.
 * Boundary: a shape class in schemas/, one declaration per file; the type of
 *           `ResendReceivedEmail.authentication`. The results come from the receiving server, not
 *           the message headers, so a sender cannot forge them.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 13 and 26, as amended by programming model
 *                     v3.1, AGENTS.md)
 */
import { Schema } from "@stackra/validation";
import type { MailAuthResult } from "#modules/messages/enums/mail-auth-result.enum";

/** DKIM and SPF must both be `pass` before a mail may act for a customer. */
export class MailAuthentication extends Schema {
  /** The SPF result. */
  spf!: MailAuthResult;

  /** The DKIM result. */
  dkim!: MailAuthResult;

  /** The DMARC result; recorded for support, not required by the inbound cancel. */
  dmarc!: MailAuthResult;
}
