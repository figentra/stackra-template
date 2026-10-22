/**
 * Stackra file contract:
 * Purpose: package defaults of the access log: which sink, and the retention the purge job
 *          enforces.
 * Boundary: a config class (types from declarations, validation from field decorators, Zod
 *           invisible). Values only; a host overrides with `override(AccessLogConfig, {...})`; a
 *           custom sink class is a host `@Replaces`. `sink` is the one `@DriverOf` choice for this
 *           port; runway `drivers.access_log` is its per-environment layer.
 * Runtime: isomorphic
 * Governing contract: ADR 0146, ADR 0095, ADR 0263
 */
import { Config, DriverOf } from "@stackra/config";
import type { DriverName } from "@stackra/container";
import { Int } from "@stackra/validation";
import { AccessLogSink } from "#contracts/access-log-sink.port";

/** Injected by type; validated once at boot. */
@Config("access_log")
export class AccessLogConfig {
  /**
   * Which registered sink runs; a typo is a type error because the names are the
   * `@Driver(AccessLogSink, name)` registrations. @defaultValue "postgres"
   */
  @DriverOf(AccessLogSink) sink: DriverName<AccessLogSink> = "postgres";
  /**
   * Days a record is kept before `PurgeAccessLogAction` deletes it; a legal minimum, so bounded
   * below.
   * @defaultValue 400
   */
  @Int({ min: 90 }) retentionDays = 400;
}
