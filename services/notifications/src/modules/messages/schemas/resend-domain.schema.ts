/**
 * Stackra file contract:
 * Purpose: `ResendDomain`: one sending domain of a Resend account, as `GET /domains` lists it.
 * Boundary: a shape class in schemas/, one declaration per file: the provider's payload, so the
 *           field names are Resend's wire names, kept verbatim. Only the fields ResendConnection's
 *           check reads are declared.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0218
 */
import { Schema } from "@stackra/validation";

/** A domain and whether Resend has verified its DNS records. */
export class ResendDomain extends Schema {
  /** Resend's id of the domain. */
  id!: string;

  /** The domain name (`acme.example`). */
  name!: string;

  /** `verified` once the DNS records check out; `pending`, `failed` and others before. */
  status!: string;
}
