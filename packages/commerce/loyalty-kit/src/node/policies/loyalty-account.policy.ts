/**
 * Stackra file contract:
 * Purpose: record-level rules for accounts. Method names are permission verbs: `redeem` refines
 *          LoyaltyAccountPermissions.redeem.
 * Boundary: a pure decision (allow | deny | abstain); no writes, no network. `PolicyFor` makes a
 *           method whose name is not a permission member a type error. A method exists only to
 *           refine a permission per record, so `expire`, which runs tenant-wide as the job, has
 *           none.
 * Runtime: node
 * Governing contract: ADR 0132 decision 4, ADR 0263 decision 10 (binding by verb)
 */
import { Decision, Policy, type PolicyFor } from "@stackra/iam";
import { Realm, type Actor } from "@stackra/contracts";
import { LoyaltyAccount } from "#node/models/loyalty-account.model";
import type { LoyaltyAccountPermissions } from "#node/permissions/loyalty-account.permission";

/**
 * Decides per account after the permission check passed. `Deny` overrides a granted permission;
 * `Abstain` leaves it.
 */
@Policy(LoyaltyAccount)
export class LoyaltyAccountPolicy implements PolicyFor<
  typeof LoyaltyAccountPermissions,
  LoyaltyAccount
> {
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

  /**
   * Freezing is staff-only by permission; the policy only refuses freezing an already deleted
   * account.
   */
  freeze(_actor: Actor, account: LoyaltyAccount): Decision {
    return account.deletedAt ? Decision.Deny : Decision.Abstain;
  }
}
