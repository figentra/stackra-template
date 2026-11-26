/**
 * Stackra file contract:
 * Purpose: `NoteService`, the standard reads and writes of `Note` rows for the note actions and queries.
 * Boundary: runs inside the caller's transaction, under the isolation transaction the pipeline opens for the call, so
 *           the tenant policy applies to every statement; `CrudService` supplies everything and this class adds
 *           nothing, so the model's partner is registered. It imports the note's personal-data declaration for its
 *           registration, so the privacy export and erasure and the hold links see notes wherever notes are stored
 *           (shortcut until gen registers `privacy/` groups, STA-339).
 * Runtime: node
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md); ADR 0305 (partners); ADR 0239; ADR
 *                     0189 (decisions 1 and 2).
 */
import "#modules/notes/privacy/note.personal-data";

import { CrudService } from "@stackra/database";

import type { Note } from "#modules/notes/models/note.model";

/** The note aggregate's service. */
export class NoteService extends CrudService<Note> {}
