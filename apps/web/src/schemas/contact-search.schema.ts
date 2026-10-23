/**
 * Stackra file contract:
 * Purpose: the contact page's query string: the plan key a "contact sales" link carries, which the
 *          form posts back as a hidden field for analytics, and the product title and variant SKU
 *          the product page's enquiry link carries, which prefill the message.
 * Boundary: a shape class the route names as `search`; a malformed value is dropped rather than a
 *           400, because the page must open from any link. The product and SKU only seed text the
 *           visitor sees and edits before sending, so they carry no authority.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 6), ADR 0095, ADR 0242 (plan keys)
 */
import { Field, Schema } from "@stackra/validation";
import { z } from "zod";

/** `?plan=enterprise` or `?product=Demo%20tee&sku=TEE-M`; all absent on the plain contact page. */
export class ContactSearch extends Schema {
  /** The plan key, up to 64 characters. */
  // reason: a malformed value is dropped (`catch`), which no field decorator expresses
  @Field(z.string().trim().max(64).optional().catch(undefined))
  plan?: string;

  /** The title of the product the visitor asks about, up to 200 characters. */
  // reason: a malformed value is dropped (`catch`), which no field decorator expresses
  @Field(z.string().trim().min(1).max(200).optional().catch(undefined))
  product?: string;

  /** The SKU of the variant the visitor had chosen, up to 64 characters. */
  // reason: a malformed value is dropped (`catch`), which no field decorator expresses
  @Field(z.string().trim().min(1).max(64).optional().catch(undefined))
  sku?: string;
}
