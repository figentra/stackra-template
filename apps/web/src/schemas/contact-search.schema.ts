/**
 * Stackra file contract:
 * Purpose: the contact page's query string: the plan key a "contact sales" link carries, which the
 *          form posts back as a hidden field for analytics.
 * Boundary: one schema class, value and type under one name; a malformed `plan` is dropped rather
 *           than a 400, because the page must open from any link.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0242 (plan keys)
 */
import { Schema, z } from "@stackra/schema";

/** `?plan=enterprise`; absent on the plain contact page. */
export class ContactSearch extends Schema(
  z.object({
    plan: z.string().trim().max(64).optional().catch(undefined),
  }),
) {}
