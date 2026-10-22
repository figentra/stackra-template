/**
 * Stackra file contract:
 * Purpose: `loyalty_kit.points.expire`: the job that expires points older than the tenant's window.
 * Boundary: a job is an action with the @AsJob adapter; @Cron only dispatches it, per tenant.
 *           `@AsJob` adds the job actor, so only `System` is listed. Same pipeline as any action
 *           (tenancy, audit, idempotency), so it is also callable from the CLI and from tests with
 *           `run`.
 * Runtime: node
 * Governing contract: ADR 0264 decision 9 (jobs are actions), ADR 0148
 */
import { Action, AsJob, type ActionContext } from "@stackra/actions";
import { ActorKind } from "@stackra/contracts";
import { Queues } from "#stackra/queues";
import { Cron } from "@stackra/scheduler";
import type { SettingsReader } from "@stackra/settings";
import type { LoyaltyLedger } from "#contracts/loyalty-ledger.port";
import { memberId } from "#core/functions/member-id.function";
import { ExpirePointsInput } from "#core/schemas/expire-points-input.schema";
import { ExpirePointsOutput } from "#core/schemas/expire-points-output.schema";
import type { AccountService } from "#node/services/account.service";
import { LoyaltyAccountPermissions } from "#node/permissions/loyalty-account.permission";
import { LoyaltySettings } from "#node/settings/loyalty.setting";

/**
 * `unique: true`: one run per tenant at a time; an overlapping tick is skipped, not queued twice.
 */
@Action({
  key: "points.expire",
  input: ExpirePointsInput,
  output: ExpirePointsOutput,
  permission: LoyaltyAccountPermissions.expire,
  actors: [ActorKind.System],
})
@AsJob({ queue: Queues.Maintenance, unique: true, timeout: "5m", retries: 3 })
@Cron("0 3 * * *", { perTenant: true, input: { batchSize: 500 } })
export class ExpirePointsAction {
  /**
   * @param settings - the window is read at run time, so a changed setting applies on the next
   * tick.
   */
  constructor(
    private readonly accounts: AccountService,
    private readonly ledger: LoyaltyLedger,
    private readonly settings: SettingsReader,
  ) {}

  /**
   * Visits active accounts oldest-updated first; `ctx.now()` is the frozen pipeline clock, so a
   * test can pin the cutoff.
   */
  async handle(input: ExpirePointsInput, ctx: ActionContext): Promise<ExpirePointsOutput> {
    const { expiryMonths } = await this.settings.for(LoyaltySettings);
    const cutoff = new Date(ctx.now());
    cutoff.setUTCMonth(cutoff.getUTCMonth() - expiryMonths);
    const accounts = await this.accounts.find(
      { isFrozen: false },
      { limit: input.batchSize, orderBy: { updatedAt: "asc" } },
    );
    let points = 0;
    for (const account of accounts)
      points += await this.ledger.expire(memberId(account.memberId), cutoff);
    return { accounts: accounts.length, points };
  }
}
