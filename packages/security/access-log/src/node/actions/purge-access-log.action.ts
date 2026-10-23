/**
 * Stackra file contract:
 * Purpose: `access_log.entry.purge@1`: the nightly job that deletes access records older than
 *          `retentionDays`.
 * Boundary: a job is an action run from a queue; its `job` option names the queue and the cron
 *           schedule that dispatches it per tenant. The only actor is the system (the job adds
 *           `ActorKind.Job` itself), so it gets no public endpoint. The key's aggregate (`entry`)
 *           is not the model's, so the permission is named. It is the only delete of an
 *           append-only model, which `Repository.purge` makes explicit.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 2, 16, 18 and 21), ADR 0148 (queue and scheduler),
 *                     ADR 0134
 */
import { Action, type ActionContext } from "@stackra/actions";
import { ActorKind, type Clock } from "@stackra/contracts";
import type { Repository } from "@stackra/database";
import { Int, Schema } from "@stackra/validation";
import { Queues } from "#stackra/queues";
import type { AccessLogConfig } from "#config/access-log.config";
import { AccessLogEntryPermissions } from "#node/access/access-log-entry.permissions";
import type { AccessLogEntry } from "#node/models/access-log-entry.model";

/** No fields: the cutoff comes from `AccessLogConfig.retentionDays`, never from the caller. */
export class PurgeAccessLogInput extends Schema {}

/** Records deleted by one run; zero is normal on a quiet day. */
export class PurgeAccessLogOutput extends Schema {
  /** How many records the run deleted. */
  @Int({ min: 0 })
  deleted!: number;
}

/**
 * `unique: true`: one run per tenant at a time; an overlapping tick is skipped, not queued twice.
 */
export class PurgeAccessLogAction extends Action({
  key: "entry.purge",
  permission: AccessLogEntryPermissions.purge,
  actors: [ActorKind.System],
  job: {
    queue: Queues.Maintenance,
    unique: true,
    timeout: "5m",
    cron: {
      schedule: "30 3 * * *",
      perTenant: true,
    },
  },
}) {
  /**
   * @param entries - the record repository, tenant-scoped by the model's trait.
   * @param config - the retention window, read at run time so an override applies on the next tick.
   * @param clock - the pipeline clock, so a test can pin the cutoff.
   */
  constructor(
    private readonly entries: Repository<AccessLogEntry>,
    private readonly config: AccessLogConfig,
    private readonly clock: Clock,
  ) {
    super();
  }

  /** Deletes every record whose `at` is older than `retentionDays` before now, in one statement. */
  async handle(_input: PurgeAccessLogInput, _ctx: ActionContext): Promise<PurgeAccessLogOutput> {
    const cutoff = new Date(this.clock.now());
    cutoff.setUTCDate(cutoff.getUTCDate() - this.config.retentionDays);
    return PurgeAccessLogOutput.create({
      deleted: await this.entries.purge({ at: { $lt: cutoff } }),
    });
  }
}
