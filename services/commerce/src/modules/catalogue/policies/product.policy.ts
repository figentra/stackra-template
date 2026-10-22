/**
 * Stackra file contract:
 * Purpose: record-level rules for products: only the tenant's own staff archive.
 * Boundary: a pure decision; the method name is the permission verb it refines. Gen requires a
 *           method here because `archive` is L2.
 * Runtime: node
 * Governing contract: ADR 0132 d4, ADR 0263 d10, guides/programming-model.mdx#policies-and-guards
 */
import { Decision, Policy, type PolicyFor } from "@stackra/iam";
import { Realm, type Actor } from "@stackra/contracts";
import { Product } from "#modules/catalogue/models/product.model";
import type { ProductPermissions } from "#modules/catalogue/permissions/product.permission";

/** Record-level rules for products: only the tenant's own staff archive. */
@Policy(Product)
export class ProductPolicy implements PolicyFor<typeof ProductPermissions, Product> {
  /**
   * Staff and agents acting for staff abstain (the role decides); a customer or service principal
   * is denied.
   */
  archive(actor: Actor): Decision {
    return actor.realm === Realm.TenantAdmin ? Decision.Abstain : Decision.Deny;
  }
}
