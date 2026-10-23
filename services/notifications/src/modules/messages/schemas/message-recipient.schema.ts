/**
 * Stackra file contract:
 * Purpose: `MessageRecipient`: who a queued message is for.
 * Boundary: a shape class; the type of `SendMessageInput.to`. A principal's public id, never an
 *           address: the address is resolved from identity at send time (ADR 0134).
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 13 and 26), ADR 0134
 */
import type { PublicId } from "@stackra/contracts";
import { Schema } from "@stackra/validation";

/** One principal. */
export class MessageRecipient extends Schema {
  /** The recipient principal's public id. */
  principalId!: PublicId<"usr">;
}
