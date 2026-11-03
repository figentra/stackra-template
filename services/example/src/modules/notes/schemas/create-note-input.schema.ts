/**
 * Stackra file contract:
 * Purpose: `CreateNoteInput`, the input of `notes.note.create@1`: the note's text.
 * Boundary: a shape class in its own file; the rule is the type plus `@Str`, which gen compiles to the schema.
 * Runtime: node
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md); ADR 0305 (one declaration per file).
 */
import { Schema, Str } from "@stackra/validation";

/** The note to add. */
export class CreateNoteInput extends Schema {
  /** The note's text, 1 to 500 characters. */
  @Str({
    min: 1,
    max: 500,
  })
  text!: string;
}
