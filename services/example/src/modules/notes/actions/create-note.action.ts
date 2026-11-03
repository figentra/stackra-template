/**
 * Stackra file contract:
 * Purpose: `CreateNoteAction`, `notes.note.create@1`: add a note. `POST /notes` by the endpoint convention, an MCP
 *          tool by default (its actors include a user); the Create page of the note resource.
 * Boundary: single aggregate, inline `handle`; its permission is `NotePermissions.create` (L1), derived from the key.
 *           `NoteService` writes the row inside the action's transaction.
 * Runtime: node
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md); ADR 0098; ADR 0360 (decision 4).
 */
import { Action, type ActionContext } from "@stackra/actions";
import { ActorKind } from "@stackra/contracts";

import type { CreateNoteInput } from "#modules/notes/schemas/create-note-input.schema";
import { CreateNoteOutput } from "#modules/notes/schemas/create-note-output.schema";
import type { NoteService } from "#modules/notes/services/note.service";

/** Not idempotent (POST): each call adds a note. */
export class CreateNoteAction extends Action({
  key: "note.create",
  actors: [ActorKind.User, ActorKind.Agent],
}) {
  /**
   * @param notes - writes the row.
   */
  constructor(private readonly notes: NoteService) {
    super();
  }

  /** Stores the note and answers it as stored. */
  async handle(input: CreateNoteInput, _ctx: ActionContext): Promise<CreateNoteOutput> {
    const note = this.notes.create({ text: input.text });
    return CreateNoteOutput.create({ id: note.id, text: note.text, createdAt: note.createdAt });
  }
}
