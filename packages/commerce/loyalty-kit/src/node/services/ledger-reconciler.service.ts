/**
 * Stackra file contract:
 * Purpose: compares two ledgers while a host migrates drivers; the one place in the kit that uses
 *          `@Named`.
 * Boundary: read-only. `@Named("primary")` is needed because two instances share the type
 *           `LoyaltyLedger`; the default one still comes by type. `@Named` is the only injection
 *           decorator left: the instances are declared by config (`LoyaltyKitConfig.ledgers`),
 *           never registered in code.
 * Runtime: node
 * Governing contract: ADR 0263 (typed constructors, named instances without forRoot)
 */
import { Named } from "@stackra/container";
import type { LoyaltyLedger } from "#contracts/loyalty-ledger.port";
import type { MemberId } from "#core/types/member-id.type";

/** Answers "do the old and the new ledger agree for this member?" during a driver migration. */
export class LedgerReconcilerService {
  /**
   * @param primary - the instance config names under `ledgers.primary`.
   * @param current - the driver config `ledger` selects; by type, no decorator.
   */
  constructor(
    @Named("primary") private readonly primary: LoyaltyLedger,
    private readonly current: LoyaltyLedger,
  ) {}

  /**
   * Compares one member's balance across the two ledgers.
   * @returns the difference `current − primary`; zero means the two ledgers agree.
   */
  async drift(member: MemberId): Promise<number> {
    const [a, b] = await Promise.all([this.primary.balance(member), this.current.balance(member)]);
    return b - a;
  }
}
