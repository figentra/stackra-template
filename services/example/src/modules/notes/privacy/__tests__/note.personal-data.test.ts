/**
 * Stackra file contract:
 * Purpose: unit tests of the notes module's privacy and retention declarations: loading `NoteService` registers
 *          `NotePersonalData` (a note's subject is its author; erasure deletes the title and text with the row), so
 *          every process that stores notes is seen by the export and erasure; and `Note` carries `Retention`, so the
 *          nightly prune job deletes a note two years after its last change.
 * Boundary: test only; reads the registries, never a database. What the declarations do to real rows (export, erasure,
 *           holds, the prune) is `note-privacy.int.test.ts`.
 * Runtime: node (vitest)
 * Governing contract: ADR 0022 (test placement); ADR 0189 (decisions 1, 2 and 4); ADR 0134 (decision 3).
 */
import { Duration } from "@stackra/contracts";
import { traitsOf } from "@stackra/model";
import { personalDataDeclarations } from "@stackra/privacy";
import { ErasureMethod } from "@stackra/privacy/contracts";
import { describe, expect, it } from "@stackra/testing";

import { NOTE_RETENTION } from "#modules/notes/constants/note-retention.constant";
import { Note } from "#modules/notes/models/note.model";
import { NoteService } from "#modules/notes/services/note.service";

/** The notes module's data-subject and retention declarations. */
describe("the notes module's personal data", () => {
  /** The declaration rides on the service every note write goes through. */
  it("is registered once NoteService is loaded, with the author as subject and the texts deleted", () => {
    expect(NoteService).toBeDefined();
    const notes = personalDataDeclarations().filter((declaration) => declaration.model === Note);
    expect(notes).toEqual([
      {
        kind: "notes.note",
        model: Note,
        subject: "authorId",
        fields: { title: ErasureMethod.Delete, body: ErasureMethod.Delete },
      },
    ]);
  });

  /** The storage limit the prune job reads. */
  it("keeps a note two years after its last change, then deletes it for good", () => {
    const retention = traitsOf(Note).find((trait) => trait.name === "retention");
    expect(retention?.options).toEqual(NOTE_RETENTION);
    expect(NOTE_RETENTION).toMatchObject({ basis: "updatedAt", policy: "hard" });
    expect(Duration.toMilliseconds(NOTE_RETENTION.keep)).toBe(730 * 86_400_000);
  });
});
