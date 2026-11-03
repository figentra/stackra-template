/**
 * Stackra file contract:
 * Purpose: `CreateNoteOutput`, the output of `notes.note.create@1`: the note as stored.
 * Boundary: a shape class in its own file; built with `CreateNoteOutput.create`, never `new`.
 * Runtime: node
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md); ADR 0305 (one declaration per file).
 */
import type { PublicId } from "@stackra/contracts";
import { Schema } from "@stackra/validation";

/** The note that was added. */
export class CreateNoteOutput extends Schema {
  /** The note's public id. */
  id!: PublicId<"not">;

  /** The note's text. */
  text!: string;

  /** When the note was written. */
  createdAt!: Date;
}
