/**
 * Stackra file contract:
 * Purpose: the permissions of the `order` resource; names are `orders.order.<member>` with no
 *          string anywhere.
 * Boundary: a decorated class of constants. The decorator assigns each static member its Permission
 *           value; gen emits the literal keys to `#stackra/permissions` and the registry. Risk
 *           lives here only: an action's risk is its permission's (ADR 0132). Gen derives "not
 *           grantable to a role" when every action using a permission has only non-human actors
 *           (ADR 0098). The resource is named (`{ resource: "order" }`), not passed as the model:
 *           OrderPaid declares `read` as its broadcast permission, and the model reaches OrderPaid
 *           through its state, so importing the model here would close a module cycle.
 * Runtime: isomorphic
 * Governing contract: ADR 0132 (permissions), ADR 0208 (names), ADR 0231,
 *                     guides/programming-model.mdx#permissions, ADR 0098
 */
import { Permission, Permissions, Risk } from "@stackra/iam";

/**
 * Referenced as `OrderPermissions.cancel` by actions, `ctx.authorize` and policies. A member name
 * is the verb; `OrderPolicy.cancel` refines it per record. Labels default to
 * `orders::permissions.order.<verb>`.
 */
@Permissions({ resource: "order" })
export class OrderPermissions {
  /** Place an order for oneself or on a customer's behalf. */
  @Permission({ risk: Risk.L1 }) static readonly create: Permission;
  /**
   * Read orders and receive the `order.paid` broadcast; the policy narrows a customer to their own.
   */
  @Permission({ risk: Risk.L0 }) static readonly read: Permission;
  /** Cancel an unpaid order. */
  @Permission({ risk: Risk.L2 }) static readonly cancel: Permission;
  /** Expire unpaid orders in bulk; only the expiry job uses it, so gen keeps it off every role. */
  @Permission({ risk: Risk.L2 }) static readonly expire: Permission;
}
