/**
 * Stackra file contract:
 * Purpose: `DeliverMessageOutput`: the output of `messages.message.deliver@1`: the result of one
 *          delivery attempt that succeeded.
 * Boundary: a shape class in schemas/, one declaration per file; gen compiles it to the action's or
 *           query's schema in `#stackra/schemas` and into openapi.json.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md)
 */
import type { PublicId } from "@stackra/contracts";
import { Schema } from "@stackra/validation";
import type { MessageStatus } from "#modules/messages/enums/message-status.enum";

/** The result of one delivery attempt that succeeded. */
export class DeliverMessageOutput extends Schema {
  /** The message's public id. */
  messageId!: PublicId<"msg">;

  /** The status it ended in; always `sent` on a successful run. */
  status!: MessageStatus;
}
