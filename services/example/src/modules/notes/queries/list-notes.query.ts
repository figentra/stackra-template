/**
 * Stackra file contract:
 * Purpose: `ListNotesQuery`, `notes.note.list@1`: the notes, newest first, one cursor page at a time. `GET /notes` by
 *          the endpoint convention and an MCP tool (queries are by default); the List page of the note resource.
 * Boundary: read only, uncached; its permission is `NotePermissions.read` (L0), derived from the key. The cursor is the
 *           last note's public id: ids are minted over UUIDv7, so their order is the creation order.
 * Runtime: node
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md); ADR 0155 (queries are MCP tools);
 *                     the HTTP conventions (cursor pagination).
 */
import { Query, type QueryContext } from "@stackra/actions";
import { ActorKind, type PublicId, SortDirection } from "@stackra/contracts";

import type { ListNotesInput } from "#modules/notes/schemas/list-notes-input.schema";
import { ListNotesOutput } from "#modules/notes/schemas/list-notes-output.schema";
import { NoteView } from "#modules/notes/schemas/note-view.schema";
import type { NoteService } from "#modules/notes/services/note.service";

/** Reads one page more than asked by one row, to know whether another page follows. */
export class ListNotesQuery extends Query({
  key: "note.list",
  actors: [ActorKind.User, ActorKind.Agent],
}) {
  /**
   * @param notes - reads the rows.
   */
  constructor(private readonly notes: NoteService) {
    super();
  }

  /** The page after `input.cursor` (the first page without one). */
  async handle(input: ListNotesInput, _ctx: QueryContext): Promise<ListNotesOutput> {
    const after = input.cursor as PublicId<"not"> | undefined;
    const rows = await this.notes.find(after === undefined ? {} : { id: { $lt: after } }, {
      orderBy: { id: SortDirection.Desc },
      limit: input.limit + 1,
    });
    const items = rows.slice(0, input.limit);
    const last = items.at(-1);
    const hasMore = rows.length > input.limit && last !== undefined;
    return ListNotesOutput.create({
      items: items.map((note) =>
        NoteView.create({ id: note.id, text: note.text, createdAt: note.createdAt }),
      ),
      hasMore,
      ...(hasMore ? { nextCursor: last.id } : {}),
    });
  }
}
