/**
 * Stackra file contract:
 * Purpose: the permissions of the `loyalty_account` resource; names are
 *          `loyalty_kit.loyalty_account.<member>` with no string anywhere. Risk lives here, on the
 *          permission, and nowhere else; the actions that use it inherit it.
 * Boundary: a decorated class of constants. The decorator assigns each static member its Permission
 *           value; gen emits the literal keys to `#stackra/permissions` and the registry. One class
 *           per resource; a resource that is not a model would be `@Permissions({ resource:
 *           "report" })`.
 * Runtime: isomorphic
 * Governing contract: ADR 0132 (permissions), ADR 0208 (names)
 */
import { Permission, Permissions, Risk } from "@stackra/iam";
import { LoyaltyAccount } from "#node/models/loyalty-account.model";

/**
 * Referenced as `LoyaltyAccountPermissions.redeem` by actions, `ctx.authorize` and the policy. A
 * member name is the verb; `LoyaltyAccountPolicy.<verb>` refines it per record. Labels default to
 * `loyalty_kit::permissions.loyalty_account.<verb>`.
 */
@Permissions(LoyaltyAccount)
export class LoyaltyAccountPermissions {
  /** Read a balance; the policy narrows a customer to their own account. */
  @Permission({ risk: Risk.L0 }) static readonly read: Permission;
  /** Enroll a principal; a customer may only enroll themselves. */
  @Permission({ risk: Risk.L1 }) static readonly enroll: Permission;
  /** Freeze or unfreeze an account for review. */
  @Permission({ risk: Risk.L2 }) static readonly freeze: Permission;
  /**
   * Spend points; the policy lets a customer spend only their own and nobody from a frozen account.
   */
  @Permission({ risk: Risk.L1 }) static readonly redeem: Permission;
  /**
   * Expire stale points in bulk; only the job and system actors use it, so gen makes it ungrantable
   * to a role.
   */
  @Permission({ risk: Risk.L2 }) static readonly expire: Permission;
}
