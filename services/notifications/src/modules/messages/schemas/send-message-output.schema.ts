/**
 * Stackra file contract:
 * Purpose: `SendMessageOutput`: the output of `messages.message.send@1`: the message's public id; a
 *          redelivered call gets the same id.
 * Boundary: a shape class in schemas/, one declaration per file; gen compiles it to the action's or
 *           query's schema in `#stackra/schemas` and into openapi.json.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md)
 */
import type { PublicId } from "@stackra/contracts";
import { Schema } from "@stackra/validation";

/** The message's public id; the same id comes back for a redelivered call. */
export class SendMessageOutput extends Schema {
  /** The message's public id. */
  messageId!: PublicId<"msg">;
}
