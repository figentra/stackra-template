/**
 * Stackra file contract:
 * Purpose: account state changes (enroll, freeze) and the earn that enrolls on first use, runs the
 *          hook chain, appends to the ledger and records the event. The only code that writes
 *          LoyaltyAccount.tier and isFrozen.
 * Boundary: exported by the module for hosts; runs inside the caller's transaction. Events are
 *           recorded on the aggregate and reach the outbox when the unit of work flushes, so a
 *           rolled-back change emits nothing. The hook point is injected as a class and called as a
 *           method. This is the one earn path: the pure maths is `LoyaltyService.quoteEarn`, which
 *           writes nothing.
 * Runtime: node
 * Governing contract: ADR 0105 (@Crud), ADR 0136, ADR 0141, ADR 0265 (the owner calls its hook
 *                     point explicitly)
 */
import type { RequestContext } from "@stackra/actions";
import type { Clock } from "@stackra/contracts";
import type { Repository } from "@stackra/database";
import { Crud, CrudService } from "@stackra/database";
import type { LoyaltyLedger } from "#contracts/loyalty-ledger.port";
import { EntryKind } from "#core/enums/entry-kind.enum";
import { LoyaltyTier } from "#core/enums/loyalty-tier.enum";
import { AccountFrozenError } from "#core/errors/account-frozen.error";
import type { EarnRequest } from "#core/interfaces/earn-request.interface";
import { LoyaltyAccountView } from "#core/schemas/loyalty-account-view.schema";
import type { LoyaltyService } from "#core/services/loyalty.service";
import type { MemberId } from "#core/types/member-id.type";
import { LoyaltyAccount } from "#node/models/loyalty-account.model";
import { AccountEnrolled } from "#node/events/account-enrolled.event";
import { AccountFrozen } from "#node/events/account-frozen.event";
import { PointsEarned } from "#node/events/points-earned.event";
import type { LoyaltyHooks } from "#node/hooks/loyalty.hook-point";
import { LoyaltyAccountPermissions } from "#node/permissions/loyalty-account.permission";

/**
 * The account aggregate's write side. `@Crud` generates `loyalty_kit.loyalty_account.list` as a
 * real query into `#stackra/crud`, guarded by `read`, narrowed per record by
 * LoyaltyAccountPolicy.read and paged as `Page(LoyaltyAccountView)`.
 */
@Crud(LoyaltyAccount, {
  actions: ["list"],
  permission: LoyaltyAccountPermissions.read,
  view: LoyaltyAccountView,
})
export class AccountService extends CrudService<LoyaltyAccount> {
  /**
   * @param accounts - the account repository, also handed to CrudService for the inherited reads.
   * @param ledger - the configured ledger driver, by type.
   * @param loyalty - the base earn maths.
   * @param hooks - the kit's hook points; `earnAdjust` runs implementers in order.
   * @param clock - the pipeline clock, frozen in tests.
   * @param request - the ambient context of the running action, listener or job, handed to the hook
   * chain.
   */
  constructor(
    protected readonly accounts: Repository<LoyaltyAccount>,
    private readonly ledger: LoyaltyLedger,
    private readonly loyalty: LoyaltyService,
    private readonly hooks: LoyaltyHooks,
    private readonly clock: Clock,
    private readonly request: RequestContext,
  ) {
    super(accounts);
  }

  /**
   * Creates an active account at `tier` and records `account.enrolled`; idempotent per (tenant,
   * member) through the unique index, so a second call returns the existing account.
   * @param accountId - the public id the client addressed; absent when the kit enrolls on a first
   * earn.
   */
  async enroll(member: MemberId, tier: LoyaltyTier, accountId?: string): Promise<LoyaltyAccount> {
    const existing = await this.accounts.findOne({ memberId: member });
    if (existing) return existing;
    const account = this.accounts.create({
      ...(accountId ? { id: accountId } : {}),
      memberId: member,
      tier,
      isFrozen: false,
      frozenAt: null,
      notes: {},
    });
    account.record(new AccountEnrolled({ accountId: account.id, memberId: member, tier }));
    return account;
  }

  /**
   * Flips the frozen flag and records `account.frozen`; repeating with the same value changes and
   * records nothing.
   */
  async setFrozen(account: LoyaltyAccount, isFrozen: boolean, at: Date): Promise<void> {
    if (account.isFrozen === isFrozen) return;
    account.isFrozen = isFrozen;
    account.frozenAt = isFrozen ? at : null;
    account.record(
      new AccountFrozen({ accountId: account.id, memberId: account.memberId, isFrozen }),
    );
  }

  /**
   * Credits a purchase: enrolls the member at bronze on their first earn, takes the base rate, runs
   * the `earnAdjust` chain (the tier multiplier), appends one ledger entry and records
   * `points.earned` v2, which promotes the tier.
   * @returns the points credited; zero for a repeated reference or a sub-point amount.
   * @throws AccountFrozenError when the account is frozen.
   */
  async earn(member: MemberId, request: EarnRequest): Promise<number> {
    const account = await this.enroll(member, LoyaltyTier.Bronze);
    if (!account.canTransact) throw new AccountFrozenError(account.id);
    const base = this.loyalty.quoteEarn(request.amountMinor);
    const points = await this.hooks.earnAdjust(
      base,
      {
        memberId: member,
        tier: account.tier,
        amountMinor: request.amountMinor,
        currency: request.currency,
      },
      this.request.current(),
    );
    if (points <= 0) return 0;
    const written = await this.ledger.append({
      memberId: member,
      points,
      kind: EntryKind.Earn,
      reference: request.reference,
      at: this.clock.now(),
    });
    if (!written) return 0;
    account.record(
      new PointsEarned({
        memberId: member,
        points,
        reference: request.reference,
        tier: account.tier,
        balanceAfter: await this.ledger.balance(member),
      }),
    );
    return points;
  }
}
