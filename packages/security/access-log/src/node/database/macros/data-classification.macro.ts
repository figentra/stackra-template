/**
 * Stackra file contract:
 * Purpose: `t.dataClassification(column)`, the column writer of the package's DataClassification
 *          field type: a text column checked against the four classification codes.
 * Boundary: a macro: discovered by gen, named from the class (`DataClassificationMacro` gives
 *           `t.dataClassification()`), typed by the generated `Blueprint` augmentation. It is named
 *           after its partner, the DataClassification enum of this package, so `stackra db diff`
 *           emits it for every model field of that type, in this package and in any host that
 *           imports it, and gen fails if its output differs from the columns the field maps to.
 *           The codes are literals, not read from the enum: released SQL is locked, so a new
 *           classification is an option that defaults to today's four codes, never an edit here.
 *           A host cannot override a macro.
 * Runtime: node
 * Governing contract: ADR 0159 (as amended by programming model v3.1, AGENTS.md: the Macro kind,
 *                     `database/macros/`), ADR 0134 (classification), ADR 0231 (check names)
 */
import { type Blueprint, type ColumnGroup, Macro } from "@stackra/database";

/** One classification column, the same set wherever a classification is stored. */
export class DataClassificationMacro extends Macro {
  /**
   * Adds `<column>` as text with the check `ck_<table>_<column>` over the four codes.
   * @param column - the column name, snake_case (`classification`).
   */
  apply(t: Blueprint, column: string): ColumnGroup {
    return t.group(t.enum(column, ["personal", "financial", "health", "pseudonymous"]));
  }
}
