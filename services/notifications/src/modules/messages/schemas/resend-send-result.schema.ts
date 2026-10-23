/**
 * Stackra file contract:
 * Purpose: `ResendSendResult`: Resend's answer to `POST /emails`.
 * Boundary: a shape class in schemas/, one declaration per file: the provider's payload, field
 *           names verbatim. ResendMailTransportDriver stores its `id` as the message's provider id.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0218
 */
import { Schema } from "@stackra/validation";

/** The id Resend gave the accepted mail. */
export class ResendSendResult extends Schema {
  /** Resend's id of the email. */
  id!: string;
}
