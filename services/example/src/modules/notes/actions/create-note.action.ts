/**
 * Stackra file contract:
 * Purpose: `CreateNoteAction`, `notes.note.create@1`: add a note to the caller's tenant. `POST /notes` by the endpoint
 *          convention, an MCP tool by default (its actors include a user).
 * Boundary: single aggregate, inline `handle`; its permission is `NotePermissions.create` (L2), derived from the key. A
 *           create is not idempotent by itself, so the key is required: a call without `Idempotency-Key` is refused
 *           (`idempotency_key_required`) before anything is written, and a retry with the same key and payload answers
 *           the first call's note. `NoteService` writes the row inside the action's transaction and under the call's
 *           tenant (never one from the input), with the call's originating principal as its author (`noteAuthorOf`,
 *           the subject of the note's personal data), and the note records `NoteCreated`, which reaches the outbox
 *           with the row.
 * Runtime: node
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md); ADR 0098; ADR 0360 (decision 4:
 *                     idempotency); ADR 0239 (tenant from the call); ADR 0189 (the author is the subject); ADR 0305
 *                     (one declaration per file).
 */
import { Action, type ActionContext, Idempotency } from "@stackra/actions";
import { ActorKind } from "@stackra/contracts";

import { NoteCreated } from "#modules/notes/events/note-created.event";
import { noteAuthorOf } from "#modules/notes/functions/note-author-of.function";
import { noteViewOf } from "#modules/notes/functions/note-view-of.function";
import type { CreateNoteInput } from "#modules/notes/schemas/create-note-input.schema";
import type { NoteView } from "#modules/notes/schemas/note-view.schema";
import type { NoteService } from "#modules/notes/services/note.service";

/**
 * Not idempotent by itself (POST): each call adds a note, so a client must send `Idempotency-Key`, and a retry with the
 * same key and payload answers the first call's note.
 */
export class CreateNoteAction extends Action({
  key: "note.create",
  actors: [ActorKind.User, ActorKind.Agent],
  idempotency: Idempotency.Required,
}) {
  private readonly notes: NoteService;

  /**
   * @param notes - writes the row.
   */
  constructor(notes: NoteService) {
    super();
    this.notes = notes;
  }

  /** Stores the note, written by the call's originating principal, and answers it as stored. */
  async handle(input: CreateNoteInput, ctx: ActionContext): Promise<NoteView> {
    const note = this.notes.create({
      authorId: noteAuthorOf(ctx.actor),
      title: input.title,
      body: input.body ?? "",
    });
    note.record(NoteCreated.create({ noteId: note.id }));
    return noteViewOf(note);
  }
}
