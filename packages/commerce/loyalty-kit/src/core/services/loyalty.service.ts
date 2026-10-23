/**
 * Stackra file contract:
 * Purpose: earning and redemption rules: how many points an amount earns, how much a balance may
 *          take off a total.
 * Boundary: generic maths over the LoyaltyLedger and LoyaltyMembers ports; no knowledge of orders
 *           or of any product. It never writes an earn: crediting a purchase is
 *           `AccountService.earn`, which enrolls, runs the extension chain and records the event.
 *           Exported by LoyaltyKitModule for hosts to inject by class.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 15, 16 and 17), ADR 0220 (integer minor units)
 */
import { Service } from "@stackra/app";
import type { LoyaltyKitConfig } from "#config/loyalty-kit.config";
import { EntryKind } from "#contracts/enums/entry-kind.enum";
import type { LoyaltyLedger } from "#contracts/ports/loyalty-ledger.port";
import type { LoyaltyMembers } from "#contracts/ports/loyalty-members.port";
import type { MemberId } from "#contracts/types/member-id.type";
import type { RedemptionQuote } from "#contracts/types/redemption-quote.type";
import { InsufficientPointsError } from "#core/errors/insufficient-points.error";
import { NotAMemberError } from "#core/errors/not-a-member.error";

/**
 * The kit's public service. Inject it by class in any module of the host.
 *
 * @example
 * constructor(private readonly loyalty: LoyaltyService) {}
 * const { amountMinor } = await this.loyalty.quote(member, requestedPoints, runningTotalMinor);
 */
export class LoyaltyService extends Service {
  /**
   * @param ledger - the port; the driver is chosen by config `ledger`.
   * @param members - implemented by the host, never by the kit.
   * @param config - the resolved config class, the host's override included.
   */
  constructor(
    private readonly ledger: LoyaltyLedger,
    private readonly members: LoyaltyMembers,
    private readonly config: LoyaltyKitConfig,
  ) {
    super();
  }

  /**
   * Largest redemption allowed for `requested` points against `totalMinor`: never more than the
   * balance, never more than `maxRedeemPercent` of the total, converted at `pointValueMinor`. Reads
   * only; nothing is held.
   * @param totalMinor - the amount still to pay at this point of the adjustment chain, in minor
   *                     units.
   * @returns zero points and zero amount when the member has no balance or the cap rounds to
   *          nothing.
   */
  async quote(member: MemberId, requested: number, totalMinor: number): Promise<RedemptionQuote> {
    const balance = await this.ledger.balance(member);
    const capMinor = Math.floor((totalMinor * this.config.maxRedeemPercent) / 100);
    const points = Math.max(
      0,
      Math.min(requested, balance, Math.floor(capMinor / this.config.pointValueMinor)),
    );
    return { points, amountMinor: points * this.config.pointValueMinor };
  }

  /**
   * The base points an amount earns before any extension runs: floor(amountMinor × earnPerMinor).
   * Pure maths: no ledger read, no write, no tier; `AccountService.earn` applies the tier
   * multiplier and credits the result.
   * @returns zero for a sub-point amount.
   */
  quoteEarn(amountMinor: number): number {
    return Math.floor(amountMinor * this.config.earnPerMinor);
  }

  /**
   * Refuses a redemption the member cannot make; used by verify extensions before anything is
   * reserved.
   * @throws NotAMemberError when the principal is not enrolled.
   * @throws InsufficientPointsError when `points` exceeds the balance.
   */
  async assertCanRedeem(member: MemberId, points: number): Promise<void> {
    if (!(await this.members.isMember(member))) {
      throw NotAMemberError.create({ principalId: member });
    }
    const balance = await this.ledger.balance(member);
    if (points > balance) throw InsufficientPointsError.create({ balance, requested: points });
  }

  /**
   * Debits `points` once per `reference`.
   * @returns the balance after the debit; unchanged when the reference was already applied.
   */
  async redeem(member: MemberId, points: number, reference: string, at: Date): Promise<number> {
    await this.ledger.append({
      memberId: member,
      points: -points,
      kind: EntryKind.Redeem,
      reference,
      at,
    });
    return this.ledger.balance(member);
  }
}
