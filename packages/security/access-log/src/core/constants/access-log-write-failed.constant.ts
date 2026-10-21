/**
 * Stackra file contract:
 * Purpose: the logger event name written when the sink rejects a record, so an operator can alert
 *          on one stable code.
 * Boundary: a module-level constant (SCREAMING_SNAKE, ADR 0231); one declaration per file (ADR
 *           0006). The same code is the key `I18n.access_log.errors.access_log_write_failed` in the
 *           lang file.
 * Runtime: isomorphic
 * Governing contract: ADR 0231, ADR 0184 (telemetry), ADR 0006
 */

/** The log event of a swallowed sink failure; machine codes are snake_case (ADR 0231). */
export const ACCESS_LOG_WRITE_FAILED = "access_log_write_failed";
