/**
 * Stackra file contract:
 * Purpose: unit tests of `noteAuthorOf`: a note's author is the call's originating principal, so a user's own call
 *          is theirs, and a call an agent or a service makes for a user, however deep the delegation, is the user's.
 * Boundary: test only; plain actors, no context.
 * Runtime: node (vitest)
 * Governing contract: ADR 0022 (test placement); ADR 0098 (decisions 6 and 7); ADR 0189 (decisions 1 and 2).
 */
import { type Actor, ActorKind, Realm } from "@stackra/contracts";
import { describe, expect, it } from "@stackra/testing";

import { noteAuthorOf } from "#modules/notes/functions/note-author-of.function";

const user: Actor = {
  kind: ActorKind.User,
  id: "usr_01ja0000000000000000000005",
  realm: Realm.Staff,
};

/** The author of a new note. */
describe(noteAuthorOf, () => {
  /** A user's own call. */
  it("is the user who makes the call", () => {
    expect(noteAuthorOf(user)).toBe(user.id);
  });

  /** One step of delegation. */
  it("is the user an agent acts for, not the agent", () => {
    const agent: Actor = {
      kind: ActorKind.Agent,
      id: "agt_01ja0000000000000000000007",
      onBehalfOf: user,
    };
    expect(noteAuthorOf(agent)).toBe(user.id);
  });

  /** A chain: a service called by an agent acting for the user. */
  it("follows the whole delegation chain to its origin", () => {
    const agent: Actor = {
      kind: ActorKind.Agent,
      id: "agt_01ja0000000000000000000007",
      onBehalfOf: user,
    };
    const service: Actor = {
      kind: ActorKind.Service,
      id: "svc_01ja0000000000000000000008",
      onBehalfOf: agent,
    };
    expect(noteAuthorOf(service)).toBe(user.id);
  });
});
