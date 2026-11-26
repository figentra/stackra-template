/**
 * Stackra file contract:
 * Purpose: `NOTE_RETENTION`, how long a note is kept: two years after it was last changed, then deleted for good. It is
 *          the storage limit of a note's personal data (GDPR Art. 5(1)(e), PDPL Art. 18): free text nobody has touched
 *          for that long is no longer needed.
 * Boundary: data only, read by `Retention` on `Note`; the nightly `data_maintenance.record.prune@1` job of
 *           `@stackra/data-maintenance` applies it in each tenant, and a legal hold on the note or on its author
 *           (`registerHoldLinks` in `note.personal-data.ts`) keeps it. A product sets its own period here: it is the
 *           model author's configuration, read at build time, never a value a tenant changes.
 * Runtime: isomorphic
 * Governing contract: ADR 0134 (decision 3: `Retention` drives the prune job; decision 4: holds suspend it); ADR 0189
 *                     (decision 4: retention defaults); ADR 0305 (one declaration per file).
 */
import { Duration } from "@stackra/contracts";
import type { RetentionOptions } from "@stackra/model";

/**
 * Two years after its last change, a note is deleted for good.
 *
 * @example
 * Model.with(HasPublicId("not"), BelongsToTenant, Timestamps, Retention(NOTE_RETENTION));
 */
export const NOTE_RETENTION: RetentionOptions = Object.freeze({
  keep: Duration.days(730),
  basis: "updatedAt",
  policy: "hard",
});
