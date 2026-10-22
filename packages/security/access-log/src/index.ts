/**
 * Stackra file contract:
 * Purpose: the package's root entry: the decorator, the service, the config and the memory sink.
 * Boundary: named re-exports only (no `export *`, ADR 0006). No symbol is exported from two
 *           entries: the classification enum comes from ./contracts only.
 * Runtime: isomorphic
 * Governing contract: ADR 0006, 0126
 */
export { AccessLogged } from "#core/decorators/access-logged.decorator";
export { AccessLogService } from "#core/services/access-log.service";
export { AccessLogConfig } from "#config/access-log.config";
export { MemoryAccessLogSink } from "#core/drivers/memory-access-log-sink.driver";
