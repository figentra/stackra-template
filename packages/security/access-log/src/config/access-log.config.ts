/**
 * Stackra file contract:
 * Purpose: package defaults of the access log: which sink, and the retention the purge job
 *          enforces.
 * Boundary: a config class: the property types are the rules, the initializers the defaults, and
 *           gen compiles them to `AccessLogConfig$`, which hosts extend. The key is the package key
 *           (`access_log`), because the file is named after the package. Values only; a host
 *           overrides with a `<Host>AccessLogConfig` subclass, and a custom sink class is a host
 *           `@Replaces(AccessLogSink)`. Runway `config.access_log.sink` is the per-environment
 *           layer of the driver choice.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 19 and 20), ADR 0146 (config layers), ADR 0263
 */
import { Config } from "@stackra/config";
import type { DriverName } from "@stackra/container";
import { Int } from "@stackra/validation";
import type { AccessLogSink } from "#contracts/ports/access-log-sink.port";

/** Injected by type; validated once at boot. */
export class AccessLogConfig extends Config {
  /** Which sink driver runs; the names are the driver file prefixes, so a typo is a type error. */
  sink: DriverName<AccessLogSink> = "postgres";

  /** Days a record is kept before `PurgeAccessLogAction` deletes it; bounded by a legal minimum. */
  @Int({ min: 90 })
  retentionDays = 400;
}
