/**
 * Stackra file contract:
 * Purpose: `loyalty_kit.points.expire@1`: the job that expires points older than the tenant's
 *          window.
 * Boundary: a job is an action run from a queue; its `job` option names the queue and the cron
 *           schedule that dispatches it per tenant. The only actor is the system (the job adds
 *           `ActorKind.Job` itself), so it gets no public endpoint, and the same pipeline applies
 *           tenancy, audit and idempotency; tests run it with `run`. The key's aggregate
 *           (`points`) is not the model's, so the permission is named.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 16, 18 and 21), ADR 0098, ADR 0148 (queue and
 *                     scheduler)
 */
import { Action, type ActionContext } from "@stackra/actions";
import { ActorKind, SortDirection } from "@stackra/contracts";
import type { SettingsReader } from "@stackra/settings";
import { Int, Schema } from "@stackra/validation";
import { Queues } from "#stackra/queues";
import type { LoyaltyLedger } from "#contracts/ports/loyalty-ledger.port";
import { memberId } from "#core/functions/member-id.function";
import { LoyaltyAccountPermissions } from "#node/access/loyalty-account.permissions";
import { LoyaltyKitSettings } from "#node/loyalty-kit.settings";
import type { AccountService } from "#node/services/account.service";

/** How many accounts one run visits; the cron passes 500. */
export class ExpirePointsInput extends Schema {
  /** Accounts per run; the next tick takes the rest. */
  @Int({
    min: 1,
    max: 5_000,
  })
  batchSize = 500;
}

/** Accounts visited and points removed; zeros are normal. */
export class ExpirePointsOutput extends Schema {
  /** Accounts this run visited. */
  @Int({ min: 0 })
  accounts!: number;

  /** Points it expired across them. */
  @Int({ min: 0 })
  points!: number;
}

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
    const { expiryMonths } = await this.settings.for(LoyaltyKitSettings);
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
