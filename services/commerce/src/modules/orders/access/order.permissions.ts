/**
 * Stackra file contract:
 * Purpose: the permissions of the order model: `orders.order.<verb>`, each with its risk.
 * Boundary: statics only; the value is the risk and nothing else. Names are derived from the
 *           module, the class (minus `Permissions`) and the static. An action's permission defaults
 *           from its key (`order.cancel` → `cancel`); OrderPolicy refines a verb per record. Every
 *           button OrderResource places needs its verb here (`cancel`, `export`), or gen fails
 *           (`action_permission_missing`, `export_permission_missing`). Labels are the derived i18n
 *           keys `orders::permissions.order.<verb>`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 16 and 20), ADR 0132, ADR 0208 (names), ADR 0099 (risk),
 *                     ADR 0164 (as amended for v3.1)
 */
import { Permission, Permissions } from "@stackra/iam";

/** Referenced as `OrderPermissions.read` by events, queries and widgets. */
export class OrderPermissions extends Permissions {
  /** Place an order for oneself, or as an agent for one's user. */
  static readonly create = Permission.L1;

  /** Read orders and receive the `order.paid` broadcast; the policy narrows a customer. */
  static readonly read = Permission.L0;

  /** Cancel an unpaid order; L2, so a person confirms it first. */
  static readonly cancel = Permission.L2;

  /** Expire unpaid orders in bulk; held only by the system actor, so no role may grant it. */
  static readonly expire = Permission.L2.system();

  /** Export the order list (OrderResource's Export button); every export is access-logged. */
  static readonly export = Permission.L1;
}
