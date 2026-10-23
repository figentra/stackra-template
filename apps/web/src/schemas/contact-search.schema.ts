/**
 * Stackra file contract:
 * Purpose: the contact page's query string: the plan key a "contact sales" link carries, which the
 *          form posts back as a hidden field for analytics.
 * Boundary: a shape class the route names as `search`; a malformed `plan` is dropped rather than a
 *           400, because the page must open from any link.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 6), ADR 0095, ADR 0242 (plan keys)
 */
import { Field, Schema } from "@stackra/validation";
import { z } from "zod";

/** `?plan=enterprise`; absent on the plain contact page. */
export class ContactSearch extends Schema {
  /** The plan key, up to 64 characters. */
  // reason: a malformed value is dropped (`catch`), which no field decorator expresses
  @Field(z.string().trim().max(64).optional().catch(undefined))
  plan?: string;
}
