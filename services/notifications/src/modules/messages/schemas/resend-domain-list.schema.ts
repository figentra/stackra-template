/**
 * Stackra file contract:
 * Purpose: `ResendDomainList`: Resend's answer to `GET /domains`.
 * Boundary: a shape class in schemas/, one declaration per file: the provider's payload, field
 *           names verbatim. Read only by ResendConnection#check.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0218
 */
import { Schema } from "@stackra/validation";
import type { ResendDomain } from "#modules/messages/schemas/resend-domain.schema";

/** The account's sending domains. */
export class ResendDomainList extends Schema {
  /** Every domain of the account the key belongs to. */
  data!: ResendDomain[];
}
