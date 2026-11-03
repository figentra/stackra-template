/**
 * Stackra file contract:
 * Purpose: unit tests of `CreateNoteAction`: the `note.create` action for users and agents, which stores the text and
 *          answers the note as stored.
 * Boundary: test only; the action is called directly with a stand-in note service and a fake action context. The
 *           pipeline's permission and transaction are the pipeline's own tests.
 * Runtime: node (vitest)
 * Governing contract: ADR 0022 (test placement); ADR 0098; ADR 0294 (as amended by programming model v3.1, AGENTS.md).
 */
import { fakeActionContext } from "@stackra/actions/testing";
import { kindOf } from "@stackra/container";
import { ActorKind, type PublicId } from "@stackra/contracts";
import { describe, expect, it } from "@stackra/testing";

import { CreateNoteAction } from "#modules/notes/actions/create-note.action";
import { Note } from "#modules/notes/models/note.model";
import { CreateNoteInput } from "#modules/notes/schemas/create-note-input.schema";
import type { NoteService } from "#modules/notes/services/note.service";

const noteId = "not_01ja0000000000000000000001" as PublicId<"not">;
const createdAt = new Date("2026-11-02T08:00:00.000Z");

/** The note.create action. */
describe(CreateNoteAction, () => {
  /** Its key and actors are what gen derives the route, permission and tool from. */
  it("is the note.create action for users and agents", () => {
    expect(kindOf(CreateNoteAction)?.options).toMatchObject({
      key: "note.create",
      actors: [ActorKind.User, ActorKind.Agent],
    });
  });

  /** The service gets exactly the text, and the answer is the stored row. */
  it("stores the text and answers the note as stored", async () => {
    const created: object[] = [];
    const notes = {
      create: (data: object) => {
        created.push(data);
        return Object.assign(new Note(), { id: noteId, createdAt }, data);
      },
    } as unknown as NoteService;

    const output = await new CreateNoteAction(notes).handle(
      CreateNoteInput.create({ text: "Buy milk" }),
      fakeActionContext(),
    );

    expect(created).toEqual([{ text: "Buy milk" }]);
    expect({ ...output }).toEqual({ id: noteId, text: "Buy milk", createdAt });
  });
});
