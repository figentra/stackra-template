/**
 * Stackra file contract:
 * Purpose: this service's host layer over @stackra/logger's defaults: what commerce redacts.
 * Boundary: only what differs from the package. Every log line passes the redaction before any
 *           reporter sees it; services log through the `Logger` port from @stackra/contracts.
 * Runtime: node
 * Governing contract: ADR 0146, ADR 0184 (telemetry and log retention); ADR 0127
 */
import { override } from "@stackra/config";
import { LoggingConfig } from "@stackra/logger";

/** Customer and payment ids are pseudonymous personal data, so they never reach a log line. */
export default override(LoggingConfig, {
  redaction: { extraFields: ["customerId", "paymentId"] },
});
