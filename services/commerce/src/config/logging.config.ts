/**
 * Stackra file contract:
 * Purpose: this service's override of @stackra/logger's configuration: the fields commerce
 *          redacts.
 * Boundary: an override declares `override` members only; a nested object is replaced whole, so the
 *           base value is merged explicitly. Every log line passes the redaction before any
 *           reporter sees it; services log through the `Logger` port from @stackra/contracts.
 * Runtime: node
 * Governing contract: ADR 0294 (decision 19), ADR 0146, ADR 0184 (telemetry and log retention)
 */
import { LoggingConfig } from "@stackra/logger";

/** Customer and payment ids are pseudonymous personal data, so they never reach a log line. */
export class CommerceLoggingConfig extends LoggingConfig {
  /** The package's redaction plus commerce's two id fields. */
  override redaction = { ...this.redaction, extraFields: ["customerId", "paymentId"] };
}
