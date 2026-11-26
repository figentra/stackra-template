/**
 * Stackra file contract:
 * Purpose: `ListNotesInput`, the input of `notes.note.list@1`: the cursor of the page to read and its size.
 * Boundary: a shape class in its own file. It declares both fields of the cursor convention itself rather than
 *           extending `CursorInput`: gen compiles a published base class's fields without their rules, which would
 *           leave `limit` unbounded and without its default (STA-2805). `limit` is 1 to 100, 20 by default; `cursor` is
 *           the `nextCursor` of the previous page, absent for the first.
 * Runtime: node
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md); ADR 0305 (one declaration per file);
 *                     the HTTP conventions (cursor pagination).
 */
import { Int, Schema } from "@stackra/validation";

/** Which page of notes to read. */
export class ListNotesInput extends Schema {
  /** How many notes to return, 1 to 100. */
  @Int({
    min: 1,
    max: 100,
  })
  limit = 20;

  /** The opaque cursor of the page to read; absent for the first page. */
  cursor?: string;
}
