/**
 * Stackra file contract:
 * Purpose: the input of the `access_log.entry.purge` job: none.
 * Boundary: a schema class only; the cutoff is computed from `AccessLogConfig.retentionDays`, never
 *           from the caller.
 * Runtime: node
 * Governing contract: ADR 0095, ADR 0128 (one declaration per file)
 */
import { Schema, z } from "@stackra/schema";

/**
 * No fields; kept as a class so the job declares an input like every other and gen can describe it.
 */
export class PurgeAccessLogInput extends Schema(z.object({})) {}
