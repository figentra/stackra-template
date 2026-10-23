/**
 * Stackra file contract:
 * Purpose: `ResendEmailReceivedData`: the `data` of Resend's `email.received` webhook: the metadata
 *          of one inbound mail.
 * Boundary: a shape class in schemas/, one declaration per file: the provider's payload, so the
 *           field names are Resend's wire names, kept verbatim. Resend's webhook carries no body
 *           and no authentication results, so CancelFromMailListener reads those from the
 *           received-email API by `email_id`. `from` is the bare sender address.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0224 (webhooks)
 */
import type { Email } from "@stackra/contracts";
import { Schema } from "@stackra/validation";

/** Which mail arrived, from whom, to whom, with what subject. */
export class ResendEmailReceivedData extends Schema {
  /** Resend's id of the received email; the key of `GET /emails/receiving/:id`. */
  email_id!: string;

  /** The sender's bare address. */
  from!: Email;

  /** The recipient addresses. */
  to!: Email[];

  /** The subject line. */
  subject!: string;
}
