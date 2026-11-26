/**
 * Stackra file contract:
 * Purpose: `noteAuthorOf(actor)`, the public id a new note records as its author: the originating principal of the
 *          call, so a note an agent writes for a user belongs to that user's data-subject requests.
 * Boundary: pure; reads the call's actor (never input) and follows `onBehalfOf` to its end.
 * Runtime: isomorphic
 * Governing contract: ADR 0098 (decisions 6 and 7: the actor and its delegation chain); ADR 0189 (decisions 1 and 2);
 *                     ADR 0305 (one declaration per file).
 */
import type { Actor, PublicId } from "@stackra/contracts";

/**
 * The originating principal's public id.
 *
 * @example
 * noteAuthorOf({ kind: ActorKind.Agent, id: "agt_…", onBehalfOf: user }); // user.id
 */
export function noteAuthorOf(actor: Actor): PublicId {
  let origin = actor;
  while (origin.onBehalfOf !== undefined) origin = origin.onBehalfOf;
  return origin.id;
}
