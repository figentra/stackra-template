/**
 * Stackra file contract:
 * Purpose: `MailAuthentication`: the SPF, DKIM and DMARC verdicts Resend's receiving server
 *          computed for an inbound mail.
 * Boundary: a shape class in schemas/, one declaration per file; the type of
 *           `ResendReceivedEmail.authentication`. SPF and DKIM each prove only that some domain
 *           sent or signed the mail: both pass for `attacker.example` while the `From` header
 *           names `customer@acme.example`. DMARC is the check that binds them to `From`: it passes
 *           only when the `From` domain aligns (relaxed mode: the same organisational domain) with
 *           the DKIM `d=` domain or the SPF envelope MAIL FROM domain that passed. So DMARC `pass`
 *           is required before a mail may act for a customer; `gray` (no DMARC policy, or
 *           `p=none`) is refused too, because it carries no alignment verdict.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 13 and 26, as amended by programming model
 *                     v3.1, AGENTS.md)
 */
import { Schema } from "@stackra/validation";
import type { MailAuthResult } from "#modules/messages/enums/mail-auth-result.enum";

/** DMARC must be `pass` before a mail may act for a customer; SPF and DKIM alone never suffice. */
export class MailAuthentication extends Schema {
  /** The SPF verdict for the envelope MAIL FROM domain. */
  spf!: MailAuthResult;

  /** The DKIM verdict for the signing `d=` domain. */
  dkim!: MailAuthResult;

  /** The DMARC verdict: `pass` only when an aligned SPF or DKIM identifier passed; required. */
  dmarc!: MailAuthResult;
}
