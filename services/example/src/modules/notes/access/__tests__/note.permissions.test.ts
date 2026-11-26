/**
 * Stackra file contract:
 * Purpose: unit tests of `NotePermissions`: the risk each note permission carries, which gen locks in the manifest and
 *          the console reads to decide when to ask for confirmation.
 * Boundary: test only; the permission statics are read directly.
 * Runtime: node (vitest)
 * Governing contract: ADR 0022 (test placement); ADR 0099 (risk); ADR 0294 (as amended by programming model v3.1,
 *                     AGENTS.md).
 */
import { Permission } from "@stackra/iam";
import { describe, expect, it } from "@stackra/testing";

import { NotePermissions } from "#modules/notes/access/note.permissions";

/** The permissions of the note model. */
describe(NotePermissions, () => {
  /** Listing changes nothing, so it is the lowest risk. */
  it("reads notes at L0", () => {
    expect(NotePermissions.read).toEqual(Permission.L0);
  });

  /** An action that writes needs at least L2 (gen's `action_risk_below_write`); L1 would let it run unconfirmed. */
  it("creates a note at L2, the lowest risk a write may carry", () => {
    expect(NotePermissions.create).toEqual(Permission.L2);
  });
});
