/**
 * Stackra file contract:
 * Purpose: `NotePermissions`, the permissions of the note model: `notes.note.<verb>`, each with its risk.
 * Boundary: statics only; the value is the risk. Keys and labels are derived from the module, the class (minus
 *           `Permissions`) and the static; `note.create` and `note.list` take theirs from their keys.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md); ADR 0208 (names); ADR 0099 (risk).
 */
import { Permission, Permissions } from "@stackra/iam";

/** Read by `ListNotesQuery`, written by `CreateNoteAction`. */
export class NotePermissions extends Permissions {
  /** List the notes. */
  static readonly read = Permission.L0;

  /** Add a note. */
  static readonly create = Permission.L1;
}
