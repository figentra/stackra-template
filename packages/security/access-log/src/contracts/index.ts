/**
 * Stackra file contract:
 * Purpose: the ./contracts entry: the port, the record shape, the classification enum and the
 *          decorator's options type (gen reads it).
 * Boundary: named re-exports only; no behaviour beyond the abstract port.
 * Runtime: isomorphic
 * Governing contract: ADR 0117 (the metadata type goes in ./contracts when gen reads it)
 */
export { AccessLogSink } from "#contracts/access-log-sink.port";
export { DataClassification } from "#core/enums/data-classification.enum";
export type { AccessRecord } from "#core/interfaces/access-record.interface";
export type { AccessLoggedOptions } from "#core/interfaces/access-logged-options.interface";
export type { AccessLoggedDecorator } from "#core/interfaces/access-logged-decorator.interface";
