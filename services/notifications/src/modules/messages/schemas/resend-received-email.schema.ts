/**
 * Stackra file contract:
 * Purpose: `ResendReceivedEmail`: Resend's answer to `GET /emails/receiving/:id`: the text of one
 *          inbound mail and the authentication verdicts the receiving server computed.
 * Boundary: a shape class in schemas/, one declaration per file: the provider's payload, field
 *           names verbatim; only the fields CancelFromMailListener reads are declared. `text` is
 *           null for an HTML-only mail; `authentication` is null for mail received before Resend
 *           recorded it, which the listener treats as a failure. The verdicts are the receiving
 *           provider's, not values parsed from the message headers, and they are trusted only
 *           because they are read through the platform integration's authenticated client after
 *           the webhook that named this mail was verified. DMARC alignment is what binds them to
 *           the `From` address the listener acts on.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0218
 */
import type { Email } from "@stackra/contracts";
import { Schema } from "@stackra/validation";
import type { MailAuthentication } from "#modules/messages/schemas/mail-authentication.schema";

/** The parts of a received mail the inbound cancel needs. */
export class ResendReceivedEmail extends Schema {
  /** Resend's id of the received email. */
  id!: string;

  /** The bare address of the `From` header: the identifier DMARC aligns. */
  from!: Email;

  /** The plain-text body, where a customer writes `CANCEL <order id>`; null when HTML only. */
  text!: string | null;

  /** SPF, DKIM and DMARC as the receiving provider computed them; null when not recorded. */
  authentication!: MailAuthentication | null;
}
