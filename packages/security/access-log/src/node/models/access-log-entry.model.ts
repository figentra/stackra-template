/**
 * Stackra file contract:
 * Purpose: the persisted access record used by the postgres sink.
 * Boundary: append-only, tenant-owned, never updated; `PurgeAccessLogAction` is the only delete.
 *           Key `access_log.access_log_entry` and table `access_log_entries` are derived from the
 *           class name.
 * Runtime: node
 * Governing contract: ADR 0097, 0134, 0239
 */
import { DateTime, Enumerated, Index, Json, Model, Str } from "@stackra/model";
import { BelongsToTenant, HasPublicId } from "@stackra/model/traits";
import { z } from "@stackra/schema";
import { DataClassification } from "#core/enums/data-classification.enum";

/** Public ids are `acl_…`. The actor chain is stored as JSON, ids only. */
@Model({ appendOnly: true })
@Index<AccessLogEntry>(["tenantId", "callId"], { unique: true })
export class AccessLogEntry extends Model.with(HasPublicId("acl"), BelongsToTenant) {
  /** The sink's idempotency key. */
  @Str({ max: 64 }) callId!: string;
  /** The called method as `<Class>.<method>`, for filtering the trail by code path. */
  @Str({ max: 200 }) target!: string;
  /** The declared classification, stored as its `value`. */
  @Enumerated(DataClassification) classification!: DataClassification;
  /**
   * The actor with its `onBehalfOf` chain; validated loosely because the Actor shape is owned by
   * `@stackra/contracts`.
   */
  @Json(z.object({ type: z.string(), id: z.string() }).passthrough()) actor!: Record<
    string,
    unknown
  >;
  /** The record ids touched. */
  @Json(z.array(z.string())) subjects!: string[];
  /** When the call started. */
  @DateTime() at!: Date;
}
