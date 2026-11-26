/**
 * Stackra file contract:
 * Purpose: `Note`, the one model of the example service: a titled text a tenant's user wrote. Key `notes.note`, table
 *          `notes.notes`, public ids `not_…`.
 * Boundary: data and rules of the fields. Tenant-owned through `BelongsToTenant`: the row carries `tenant_id` from the
 *           running call (never from input), and the database forces a row-level policy on it, so another tenant's
 *           notes are invisible even to a query that forgets a filter. `authorId` is the person the note is about in a
 *           data-subject request: the originating principal of the creating call (never input), which
 *           `NotePersonalData` names as the subject. The `@Classified` marks state what each field holds for export,
 *           erasure and the access log. `Retention` is the storage limit (`NOTE_RETENTION`): a note nobody has changed
 *           for two years is deleted for good by the nightly `data_maintenance.record.prune` job, unless a legal hold
 *           covers the note or its author.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4 and 20); ADR 0321 and 0323 d1 (`BelongsToTenant`); ADR 0239 (equality on
 *                     `tenant_id`); ADR 0134 (classification; decision 3: `Retention` drives the prune job); ADR 0189
 *                     (decisions 1, 2 and 4); ADR 0305 (one declaration per file).
 */
import { DataClassification } from "@stackra/contracts";
import { HasPublicId, Model, Retention, Timestamps } from "@stackra/model";
import { BelongsToTenant } from "@stackra/tenancy/node";
import { Classified, Str } from "@stackra/validation";

import { NOTE_RETENTION } from "#modules/notes/constants/note-retention.constant";

/** A titled text, one row of `notes.notes`. */
export class Note extends Model.with(
  HasPublicId("not"),
  BelongsToTenant,
  Timestamps,
  Retention(NOTE_RETENTION),
) {
  /** The public id of the person who wrote the note (`usr_…`), the subject of its personal data. */
  @Classified(DataClassification.Pseudonymous)
  @Str({ max: 64 })
  authorId!: string;

  /** The note's title, 1 to 120 characters. */
  @Classified(DataClassification.Personal)
  @Str({
    min: 1,
    max: 120,
  })
  title!: string;

  /** The note's text, up to 2000 characters; empty when the note is only a title. */
  @Classified(DataClassification.Personal)
  @Str({ max: 2000 })
  body!: string;
}
