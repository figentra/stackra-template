/**
 * Stackra file contract:
 * Purpose: the package's root entry: the decorator, the classification enum, the service, the
 *          config and the memory sink.
 * Boundary: named re-exports only (no `export *`, ADR 0006).
 * Runtime: isomorphic
 * Governing contract: ADR 0006, 0126
 */
export { AccessLogged } from "#core/decorators/access-logged.decorator";
export { DataClassification } from "#core/enums/data-classification.enum";
export { AccessLogService } from "#core/services/access-log.service";
export { AccessLogConfig } from "#config/access-log.config";
export { MemoryAccessLogSink } from "#core/drivers/memory-access-log-sink.driver";
