/**
 * Stackra file contract:
 * Purpose: `AccountNotes`: the shape of the merchant notes jsonb column on a loyalty account.
 * Boundary: a shape class, a nested element type of the model, so it lives in schemas; node-only
 *           because only the model and the resource read it. Validated on write, parsed on read.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 13 and 26)
 */
import { Schema, Str } from "@stackra/validation";

/** Free-form notes staff leave when flagging an account; both fields are optional. */
export class AccountNotes extends Schema {
  /** The staff member who flagged the account. */
  flaggedBy?: string;

  /** Why it was flagged. */
  @Str({ max: 500 })
  reason?: string;
}
