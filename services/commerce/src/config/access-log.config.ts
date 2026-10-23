/**
 * Stackra file contract:
 * Purpose: this service's override of @acme/access-log's configuration: the retention period.
 * Boundary: an override declares `override` members only and no new field; it inherits the base's
 *           key (`access_log`) and replaces the base across the whole host. The sink stays the
 *           package default (`postgres`; runway sets `memory` in dev), so no driver is named here.
 * Runtime: node
 * Governing contract: ADR 0294 (decision 19), ADR 0146 (config layers)
 */
import { AccessLogConfig } from "@acme/access-log";

/** Commerce keeps access records for the legal minimum of its market; the purge job honours it. */
export class CommerceAccessLogConfig extends AccessLogConfig {
  /** Days a record is kept before the purge job removes it. */
  override retentionDays = 365;
}
