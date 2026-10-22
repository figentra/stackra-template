/**
 * Stackra file contract:
 * Purpose: `access_log.entry.purge`: the nightly job that deletes access records older than
 *          `retentionDays`.
 * Boundary: a job is an action with the @AsJob adapter; @Cron only dispatches it, per tenant. It is
 *           the only delete of an append-only model, which `Repository.purge` makes explicit.
 *           `@AsJob` adds the job actor, so only `System` is listed.
 * Runtime: node
 * Governing contract: ADR 0264 decision 9 (jobs are actions), ADR 0148, ADR 0134
 */
import { Action, AsJob, type ActionContext } from "@stackra/actions";
import { Clock, ActorKind } from "@stackra/contracts";
import { Repository } from "@stackra/database";
import { Cron } from "@stackra/scheduler";
import { Queues } from "#stackra/queues";
import { AccessLogConfig } from "#config/access-log.config";
import { AccessLogEntry } from "#node/models/access-log-entry.model";
import { AccessLogEntryPermissions } from "#node/permissions/access-log-entry.permission";
import { PurgeAccessLogInput } from "#node/schemas/purge-access-log-input.schema";
import { PurgeAccessLogOutput } from "#node/schemas/purge-access-log-output.schema";

/**
 * `unique: true`: one run per tenant at a time; an overlapping tick is skipped, not queued twice.
 */
@Action({
  key: "entry.purge",
  input: PurgeAccessLogInput,
  output: PurgeAccessLogOutput,
  permission: AccessLogEntryPermissions.purge,
  actors: [ActorKind.System],
})
@AsJob({ queue: Queues.Maintenance, unique: true, timeout: "5m" })
@Cron("30 3 * * *", { perTenant: true })
export class PurgeAccessLogAction {
  /**
   * @param entries - the record repository, tenant-scoped by the model's trait.
   * @param config - the retention window, read at run time so an override applies on the next tick.
   * @param clock - the pipeline clock, so a test can pin the cutoff.
   */
  constructor(
    private readonly entries: Repository<AccessLogEntry>,
    private readonly config: AccessLogConfig,
    private readonly clock: Clock,
  ) {}

  /** Deletes every record whose `at` is older than `retentionDays` before now, in one statement. */
  async handle(_input: PurgeAccessLogInput, _ctx: ActionContext): Promise<PurgeAccessLogOutput> {
    const cutoff = new Date(this.clock.now());
    cutoff.setUTCDate(cutoff.getUTCDate() - this.config.retentionDays);
    return { deleted: await this.entries.purge({ at: { $lt: cutoff } }) };
  }
}
