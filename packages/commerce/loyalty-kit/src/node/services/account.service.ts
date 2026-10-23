/**
 * Stackra file contract:
 * Purpose: account state changes (enroll, freeze) and the earn that enrolls on first use, runs the
 *          extension chain, appends to the ledger and records the event. The only code that
 *          writes LoyaltyAccount.tier at enrolment and isFrozen.
 * Boundary: exported by the module for hosts; runs inside the caller's transaction.
 *           CrudService(LoyaltyAccount) supplies the inherited reads and writes (`find`,
 *           `findOne`, `findOneOrFail`, `create`), which the resource's generated list and get
 *           operations call too. Events are recorded on the aggregate and reach the outbox when
 *           the unit of work flushes, so a rolled-back change emits nothing. The extension point
 *           is injected as a class and called as a method. This is the one earn path: the pure
 *           maths is `LoyaltyService.quoteEarn`, which writes nothing.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 16 and 27), ADR 0105 (as amended), ADR 0136,
 *                     ADR 0141, ADR 0265 (the owner calls its extension point explicitly)
 */
import type { RequestContext } from "@stackra/actions";
import type { Clock, PublicId } from "@stackra/contracts";
import { CrudService } from "@stackra/database";
import { EntryKind } from "#contracts/enums/entry-kind.enum";
import { LoyaltyTier } from "#contracts/enums/loyalty-tier.enum";
import type { LoyaltyLedger } from "#contracts/ports/loyalty-ledger.port";
import type { EarnRequest } from "#contracts/types/earn-request.type";
import type { MemberId } from "#contracts/types/member-id.type";
import { AccountFrozenError } from "#core/errors/account-frozen.error";
import type { LoyaltyService } from "#core/services/loyalty.service";
import { AccountEnrolled } from "#node/events/account-enrolled.event";
import { AccountFrozen } from "#node/events/account-frozen.event";
import { PointsEarned } from "#node/events/points-earned.event";
import type { LoyaltyKitExtensionPoint } from "#node/extensions/loyalty-kit.extension-point";
import { LoyaltyAccount } from "#node/models/loyalty-account.model";

/** The account aggregate's write side. */
export class AccountService extends CrudService(LoyaltyAccount) {
  /**
   * @param ledger - the configured ledger driver, by type.
   * @param loyalty - the base earn maths.
   * @param extensions - the kit's extension points; `earnAdjust` runs implementers in order.
   * @param clock - the pipeline clock, frozen in tests.
   * @param request - the ambient context of the running action, listener or job, handed to the
   *                  extension chain.
   */
  constructor(
    private readonly ledger: LoyaltyLedger,
    private readonly loyalty: LoyaltyService,
    private readonly extensions: LoyaltyKitExtensionPoint,
    private readonly clock: Clock,
    private readonly request: RequestContext,
  ) {
    super();
  }

  /**
   * Creates an active account at `tier` and records `account.enrolled`; idempotent per (tenant,
   * member) through the unique index, so a second call returns the existing account.
   * @param accountId - the public id the client addressed; absent when the kit enrolls on a first
   *                    earn.
   */
  async enroll(
    member: MemberId,
    tier: LoyaltyTier,
    accountId?: PublicId<"lac">,
  ): Promise<LoyaltyAccount> {
    const existing = await this.findOne({ memberId: member });
    if (existing) return existing;
    const account = this.create({
      ...(accountId ? { id: accountId } : {}),
      memberId: member,
      tier,
    });
    account.record(AccountEnrolled.create({ accountId: account.id, memberId: member, tier }));
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
      AccountFrozen.create({ accountId: account.id, memberId: account.memberId, isFrozen }),
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
    if (!account.canTransact) throw AccountFrozenError.create({ accountId: account.id });
    const base = this.loyalty.quoteEarn(request.amountMinor);
    const points = await this.extensions.earnAdjust(
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
      PointsEarned.create({
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
