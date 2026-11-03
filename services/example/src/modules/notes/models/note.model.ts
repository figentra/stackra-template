/**
 * Stackra file contract:
 * Purpose: `Note`, the one model of the example module: a note with a text. Key `notes.note`, table `notes.notes`,
 *          public ids `not_…`.
 * Boundary: data only; a plain non-tenant model, replace it with your own. The shape is what `stackra new service
 *           --data` writes, so the starter and the scaffolder agree.
 * Runtime: node
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md); ADR 0305 (one declaration per file).
 */
import { HasPublicId, Model, Timestamps } from "@stackra/model";
import { Str } from "@stackra/validation";

/** A short text someone wrote, one row of `notes.notes`. */
export class Note extends Model.with(HasPublicId("not"), Timestamps) {
  /** The note's text. */
  @Str({ max: 500 })
  text!: string;
}
