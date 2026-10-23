/**
 * Stackra file contract:
 * Purpose: `loyalty_kit.points.expire@1`: the job that expires points older than the tenant's
 *          window.
 * Boundary: a job is an action run from a queue; its `job` surface names the queue and the cron
 *           schedule that dispatches it per tenant, and gen checks the cron's `input` against
 *           ExpirePointsInput. The only actor is the system (the job adds `ActorKind.Job` itself),
 *           so it gets no endpoint and no tool, and the same pipeline applies tenancy, audit and
 *           idempotency; tests run it with `run`. The key's aggregate (`points`) is not the
 *           model's, so the permission is named.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 16, 18 and 21, as amended by programming model v3.1,
 *                     AGENTS.md), ADR 0098, ADR 0148 (queue and scheduler)
 */
import { Action, type ActionContext } from "@stackra/actions";
import { ActorKind, SortDirection } from "@stackra/contracts";
import type { SettingsReader } from "@stackra/settings";
import { Queues } from "#stackra/queues";
import type { LoyaltyLedger } from "#contracts/ports/loyalty-ledger.port";
import { memberId } from "#core/functions/member-id.function";
import { LoyaltyAccountPermissions } from "#node/access/loyalty-account.permissions";
import { LoyaltyKitSettings } from "#node/loyalty-kit.settings";
import type { ExpirePointsInput } from "#node/schemas/expire-points-input.schema";
import { ExpirePointsOutput } from "#node/schemas/expire-points-output.schema";
import type { AccountService } from "#node/services/account.service";

/**
 * `unique: true`: one run per tenant at a time; an overlapping tick is skipped, not queued twice.
 */
export class ExpirePointsAction extends Action({
  key: "points.expire",
  permission: LoyaltyAccountPermissions.expire,
  actors: [ActorKind.System],
  job: {
    queue: Queues.Maintenance,
    unique: true,
    timeout: "5m",
    retries: 3,
    cron: {
      schedule: "0 3 * * *",
      perTenant: true,
      input: { batchSize: 500 },
    },
  },
}) {
  /**
   * @param settings - the window is read at run time, so a changed setting applies on the next
   *                   tick.
   */
  constructor(
    private readonly accounts: AccountService,
    private readonly ledger: LoyaltyLedger,
    private readonly settings: SettingsReader,
  ) {
    super();
  }

  /**
   * Visits active accounts oldest-updated first; `ctx.now()` is the frozen pipeline clock, so a
   * test can pin the cutoff.
   */
  async handle(input: ExpirePointsInput, ctx: ActionContext): Promise<ExpirePointsOutput> {
    const { expiryMonths } = await this.settings.get(LoyaltyKitSettings);
    const cutoff = new Date(ctx.now());
    cutoff.setUTCMonth(cutoff.getUTCMonth() - expiryMonths);
    const accounts = await this.accounts.find(
      { isFrozen: false },
      { limit: input.batchSize, orderBy: { updatedAt: SortDirection.Asc } },
    );
    let points = 0;
    for (const account of accounts) {
      points += await this.ledger.expire(memberId(account.memberId), cutoff);
    }
    return ExpirePointsOutput.create({ accounts: accounts.length, points });
  }
}
