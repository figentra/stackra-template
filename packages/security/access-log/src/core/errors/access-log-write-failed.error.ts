/**
 * Stackra file contract:
 * Purpose: the refusal a sink throws when it cannot store an access record (its store is down).
 * Boundary: a refusal class: kind `Unavailable`, code derived from the class name
 *           (`access_log_write_failed`, the same code AccessLogService logs when it swallows the
 *           failure); text `access_log::errors.access_log_write_failed.message`. It never reaches
 *           a caller: AccessLogService catches every sink failure so a read is still served. It
 *           carries no fields, so no record content or personal data travels with it.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 16 and 20, as amended by programming model v3.1,
 *                     AGENTS.md), ADR 0140 (envelope and kinds)
 */
import { ErrorKind, Refusal } from "@stackra/errors";

/** Retryable: the record is keyed by its callId, so an operator may replay the write. */
export class AccessLogWriteFailedError extends Refusal({
  kind: ErrorKind.Unavailable,
  retryable: true,
}) {}
