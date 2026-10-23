/**
 * Stackra file contract:
 * Purpose: the access log's configuration class: which sink, and the retention the purge job
 *          enforces.
 * Boundary: the class is the DI token and its key is derived from the file name (`access_log`).
 *           `schema` names the shape (AccessLogOptions); `env` maps the one field read from the
 *           environment to its variable. Values only; a custom sink class is a host
 *           `@Replaces(AccessLogSink)`, and runway `config.access_log.sink` is the per-environment
 *           layer of the driver choice. A second override of this class, or a second class with
 *           the key, fails gen.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 19 and 20), ADR 0146 (config layers, as amended by
 *                     programming model v3.1, AGENTS.md), ADR 0263
 */
import { Config } from "@stackra/config";
import { AccessLogOptions } from "#core/schemas/access-log-options.schema";

/**
 * Injected by type; validated once at boot. A host overrides values under the same name:
 *
 * @example
 * ```ts
 * import { AccessLogConfig as BaseAccessLogConfig } from "@acme/access-log";
 *
 * export class AccessLogConfig extends BaseAccessLogConfig {
 *   override retentionDays = 730;
 * }
 * ```
 */
export class AccessLogConfig extends Config({
  schema: AccessLogOptions,
  env: { sink: "STACKRA_ACCESS_LOG_SINK" },
}) {}
