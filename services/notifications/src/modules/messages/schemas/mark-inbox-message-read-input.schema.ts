/**
 * Stackra file contract:
 * Purpose: `MarkInboxMessageReadInput`: the input of `messages.inbox_message.mark_read@1`: the
 *          entry to mark read, from the path; the principal is the actor.
 * Boundary: a shape class in schemas/, one declaration per file; gen compiles it to the action's or
 *           query's schema in `#stackra/schemas` and into openapi.json.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md)
 */
import type { PublicId } from "@stackra/contracts";
import { Schema } from "@stackra/validation";

/** The entry to mark read, taken from the path; the principal is the actor, never an input. */
export class MarkInboxMessageReadInput extends Schema {
  /** The entry's public id. */
  inboxMessageId!: PublicId<"inm">;
}
