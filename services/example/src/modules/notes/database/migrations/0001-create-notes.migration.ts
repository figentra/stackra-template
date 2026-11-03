/**
 * Stackra file contract:
 * Purpose: the first migration of the example module: the `notes` table of `Note`, in the module's `notes` schema.
 * Boundary: a frozen snapshot that uses only `@stackra/database`; every name is a literal.
 * Runtime: node
 * Governing contract: ADR 0159 (as amended); ADR 0294 (as amended by programming model v3.1, AGENTS.md).
 */
import { type Blueprint, Migration, type SchemaBuilder } from "@stackra/database";

/** Creates the notes table. */
export class CreateNotesMigration extends Migration {
  /** Creates the table with its public id, timestamps and text. */
  up(schema: SchemaBuilder): void {
    schema.create("notes", (t: Blueprint) => {
      t.hasPublicId("not");
      t.timestamps();
      t.string("text", 500).notNull().comment("The note's text.");
    });
  }
}
