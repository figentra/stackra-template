/**
 * Stackra file contract:
 * Purpose: record rules for products: only the tenant's own staff archive.
 * Boundary: a pure decision (allow, deny or abstain); no writes, no network. Each method is named
 *           after a verb of ProductPermissions and runs inside `handle` through
 *           `ctx.authorize(product)`, after the permission step passed. Gen requires the `archive`
 *           method because that verb is L2; the other verbs have no record rule.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 16 and 23), ADR 0132 d4, ADR 0138 (as amended), ADR 0098
 */
import { type Actor, Realm } from "@stackra/contracts";
import { Decision, Policy } from "@stackra/iam";
import { ProductPermissions } from "#modules/catalogue/access/product.permissions";

/** `deny` beats a granted permission; `abstain` leaves the permission as the whole answer. */
export class ProductPolicy extends Policy(ProductPermissions) {
  /** Staff abstain, so their role decides; a customer or a service principal is denied. */
  archive(actor: Actor): Decision {
    return actor.realm === Realm.Tenant ? Decision.Abstain : Decision.Deny;
  }
}
