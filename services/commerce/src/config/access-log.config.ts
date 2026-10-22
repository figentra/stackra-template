/**
 * Stackra file contract:
 * Purpose: this service's host layer over @acme/access-log's package defaults.
 * Boundary: only what differs from the package. The sink stays the package's default driver
 *           (`postgres`; runway sets `memory` in dev), so no driver name is restated here .
 * Runtime: node
 * Governing contract: ADR 0146, ADR 0263 d9, ADR 0266
 */
import { override } from "@stackra/config";
import { AccessLogConfig } from "@acme/access-log";

/** Commerce keeps access records for the legal minimum of its market; the purge job honours it. */
export default override(AccessLogConfig, { retentionDays: 365 });
