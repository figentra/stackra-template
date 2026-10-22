/**
 * Stackra file contract:
 * Purpose: the node entry: module, Explorer, postgres sink, its model, the permissions and the
 *          purge job, and the migration.
 * Boundary: named re-exports only; the resource is discovered by folder. The migration is exported
 *           because a host's manifest references it as `{ from: "@acme/access-log/node", class
 *           }`, never by `src/` path.
 * Runtime: node
 * Governing contract: ADR 0126, ADR 0006
 */
export { AccessLogModule } from "#node/access-log.module";
export { AccessLogExplorer } from "#node/access-log.explorer";
export { PostgresAccessLogSink } from "#node/drivers/postgres-access-log-sink.driver";
export { AccessLogEntry } from "#node/models/access-log-entry.model";
export { AccessLogEntryPermissions } from "#node/permissions/access-log-entry.permission";
export { PurgeAccessLogAction } from "#node/actions/purge-access-log.action";
export { CreateAccessLogEntries } from "#node/migrations/0001-create-access-log-entries.migration";
