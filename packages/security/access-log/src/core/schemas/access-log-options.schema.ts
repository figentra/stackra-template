/**
 * Stackra file contract:
 * Purpose: `AccessLogOptions`: the shape of the access log's configuration: which sink, and the
 *          retention the purge job enforces.
 * Boundary: a shape class, the `schema` of AccessLogConfig; isomorphic, so it ships from the `.`
 *           entry beside the config class. Field types are the rules and initializers the package
 *           defaults. The sink is a `DriverName<AccessLogSink>` field, so a typo is a type error.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 19 and 26), ADR 0146 (config layers, as amended by
 *                     programming model v3.1, AGENTS.md), ADR 0134
 */
import type { DriverName } from "@stackra/container";
import { Int, Schema } from "@stackra/validation";
import type { AccessLogSink } from "#contracts/ports/access-log-sink.port";

/** Every option the package reads; a host changes values in its config override. */
export class AccessLogOptions extends Schema {
  /** Which sink driver runs; the names are the driver file prefixes (`postgres`, `memory`). */
  sink: DriverName<AccessLogSink> = "postgres";

  /** Days a record is kept before `PurgeAccessLogAction` deletes it; bounded by a legal minimum. */
  @Int({ min: 90 })
  retentionDays = 400;
}
