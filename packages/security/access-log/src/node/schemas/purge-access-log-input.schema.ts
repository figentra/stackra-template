/**
 * Stackra file contract:
 * Purpose: `PurgeAccessLogInput`: the input of the `access_log.entry.purge@1` job.
 * Boundary: a shape class in its own file with no fields: the cutoff comes from
 *           `AccessLogConfig.retentionDays`, never from the caller.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 4, 13 and 26, as amended by programming model v3.1,
 *                     AGENTS.md)
 */
import { Schema } from "@stackra/validation";

/** No fields. */
export class PurgeAccessLogInput extends Schema {}
