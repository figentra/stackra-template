/**
 * Stackra file contract:
 * Purpose: record rules for stock: only the tenant's own staff and its services adjust.
 * Boundary: a pure decision (allow, deny or abstain); no writes, no network. It runs inside
 *           `handle` through `ctx.authorize(level)`, after the permission step passed. Gen requires
 *           the `manage` method because that verb is L2; reading stock has no record rule.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 16 and 23), ADR 0132 d4, ADR 0138 (as amended), ADR 0098
 */
import { type Actor, Realm } from "@stackra/contracts";
import { Decision, Policy } from "@stackra/iam";
import { StockPermissions } from "#modules/inventory/access/stock.permissions";

/** `deny` beats a granted permission; `abstain` leaves the permission as the whole answer. */
export class StockPolicy extends Policy(StockPermissions) {
  /** A customer is denied whatever role they hold; everyone else is left to the permission. */
  manage(actor: Actor): Decision {
    return actor.realm === Realm.Customer ? Decision.Deny : Decision.Abstain;
  }
}
