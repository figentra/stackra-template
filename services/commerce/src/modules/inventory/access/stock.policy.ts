/**
 * Stackra file contract:
 * Purpose: record rules for stock: only the tenant's own staff and its services adjust.
 * Boundary: bound to StockLevel by the type argument (`Policy<StockLevel>`). The permissions class
 *           is named after the resource people are granted (`stock`), not the model, so its stem
 *           differs and it is the one option (`permissions`). A pure decision (allow, deny or
 *           abstain); no writes, no network. It runs inside `handle` through
 *           `ctx.authorize(level)`, after the permission step passed. Gen requires the `manage`
 *           method because that verb is L2; reading stock has no record rule.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 16 and 23), ADR 0132 d4, ADR 0138 (as amended), ADR 0098
 */
import { type Actor, Realm } from "@stackra/contracts";
import { Decision, Policy } from "@stackra/iam";
import { StockPermissions } from "#modules/inventory/access/stock.permissions";
import type { StockLevel } from "#modules/inventory/models/stock-level.model";

/** `deny` beats a granted permission; `abstain` leaves the permission as the whole answer. */
export class StockPolicy extends Policy<StockLevel>({ permissions: StockPermissions }) {
  /** A customer is denied whatever role they hold; everyone else is left to the permission. */
  manage(actor: Actor): Decision {
    return actor.realm === Realm.Customer ? Decision.Deny : Decision.Abstain;
  }
}
