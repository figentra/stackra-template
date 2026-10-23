/**
 * Stackra file contract:
 * Purpose: this service's override of @acme/access-log's configuration: the retention period.
 * Boundary: an override keeps its base's name and imports the base as `BaseAccessLogConfig`; it
 *           declares `override` members only (no `schema` or `env` of its own) and no new field; it
 *           inherits the base's key (`access_log`) and replaces the base across the whole host. The
 *           sink stays the package default (`postgres`; runway sets `memory` in dev), so no driver
 *           is named here.
 * Runtime: node
 * Governing contract: ADR 0294 (decision 19, as amended by programming model v3.1, AGENTS.md),
 *                     ADR 0146 (config layers)
 */
import { AccessLogConfig as BaseAccessLogConfig } from "@acme/access-log";

/** Commerce keeps access records for the legal minimum of its market; the purge job honours it. */
export class AccessLogConfig extends BaseAccessLogConfig {
  /** Days a record is kept before the purge job removes it. */
  override retentionDays = 365;
}
