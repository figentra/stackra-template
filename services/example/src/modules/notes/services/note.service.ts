/**
 * Stackra file contract:
 * Purpose: `NoteService`, the standard reads and writes of `Note` rows for the note action and query.
 * Boundary: runs inside the caller's transaction; `CrudService` supplies everything and this class adds nothing, so the
 *           model's partner is registered.
 * Runtime: node
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md); ADR 0305 (partners).
 */
import { CrudService } from "@stackra/database";

import type { Note } from "#modules/notes/models/note.model";

/** The note aggregate's service. */
export class NoteService extends CrudService<Note> {}
