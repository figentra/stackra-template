/**
 * Stackra file contract:
 * Purpose: the persisted access record the postgres sink writes.
 * Boundary: data and indexes. Key `access_log.access_log_entry`, table
 *           `access_log.access_log_entries` (the package's Postgres schema), public ids `acl_…`.
 *           Append-only by trait, tenant-owned, never updated; `PurgeAccessLogAction` is the only
 *           delete. Every index is declared here (`@Index`, and the filter index of `@Searchable`),
 *           so `stackra db diff` never proposes dropping one. `@Searchable` makes the called method
 *           searchable from the audit-trail list and the classification a filter; record ids and
 *           the actor stay out of the search document. No constructor-made state.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 20 and 27), ADR 0134, ADR 0221 (search), ADR 0239
 *                     (BelongsToTenant)
 */
import type { Json } from "@stackra/contracts";
import { AppendOnly, BelongsToTenant, HasPublicId, Index, Model, Searchable } from "@stackra/model";
import { Str } from "@stackra/validation";
import type { DataClassification } from "#contracts/enums/data-classification.enum";

/** The actor chain is stored as JSON, ids only, exactly as the sink received it. */
@Index(["tenantId", "callId"], { unique: true })
@Index(["at"])
@Searchable({
  text: ["target"],
  filters: ["classification"],
})
export class AccessLogEntry extends Model.with(HasPublicId("acl"), BelongsToTenant, AppendOnly) {
  /** The sink's idempotency key. */
  @Str({ max: 64 })
  callId!: string;

  /** The called method as `<Class>.<method>`, for filtering the trail by code path. */
  @Str({ max: 200 })
  target!: string;

  /** The declared classification. */
  classification!: DataClassification;

  /** The actor with its `onBehalfOf` chain; jsonb, as the sink received it. */
  actor!: Json;

  /** The public ids of the people whose data the call touched; jsonb. */
  subjects!: string[];

  /** When the call started. */
  at!: Date;
}
