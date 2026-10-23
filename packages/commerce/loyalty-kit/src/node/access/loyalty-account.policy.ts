/**
 * Stackra file contract:
 * Purpose: record rules for loyalty accounts. Each method is named after a verb of
 *          LoyaltyAccountPermissions and refines that permission for one account.
 * Boundary: a pure decision (allow, deny or abstain); no writes, no network. It runs inside
 *           `handle` through `ctx.authorize(account)`, after the permission step passed, so a
 *           method exists only where a verb needs a record rule: `expire`, which runs tenant-wide
 *           as the job, has none.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 16 and 23), ADR 0132 d4, ADR 0098
 */
import { type Actor, Realm } from "@stackra/contracts";
import { Decision, Policy } from "@stackra/iam";
import { LoyaltyAccountPermissions } from "#node/access/loyalty-account.permissions";
import type { LoyaltyAccount } from "#node/models/loyalty-account.model";

/** `deny` beats a granted permission; `abstain` leaves the permission as the whole answer. */
export class LoyaltyAccountPolicy extends Policy(LoyaltyAccountPermissions) {
  /** A customer reads only their own account; every other realm is left to the permission. */
  read(actor: Actor, account: LoyaltyAccount): Decision {
    return actor.realm === Realm.Customer && account.memberId !== actor.id
      ? Decision.Deny
      : Decision.Abstain;
  }

  /** Nobody redeems from a frozen account; a customer only from their own. */
  redeem(actor: Actor, account: LoyaltyAccount): Decision {
    if (!account.canTransact) return Decision.Deny;
    return this.read(actor, account);
  }

  /** Freezing is staff-only by permission; the policy only refuses a deleted account. */
  freeze(_actor: Actor, account: LoyaltyAccount): Decision {
    return account.deletedAt ? Decision.Deny : Decision.Abstain;
  }
}
