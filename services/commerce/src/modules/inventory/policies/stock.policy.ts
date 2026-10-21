/**
 * Stackra file contract:
 * Purpose: record-level rules for stock: only the tenant's own staff and its services adjust.
 * Boundary: a pure decision; gen requires a method because `manage` is L2.
 * Runtime: node
 * Governing contract: ADR 0132 d4, guides/programming-model.mdx#policies-and-guards
 */
import { Decision, Policy, type PolicyFor } from "@stackra/iam";
import { Realm, type Actor } from "@stackra/contracts";
import { StockLevel } from "#modules/inventory/models/stock-level.model";
import { StockPermissions } from "#modules/inventory/permissions/stock.permission";

/** Record-level rules for stock: only the tenant's own staff and its services adjust. */
@Policy(StockLevel)
export class StockPolicy implements PolicyFor<typeof StockPermissions, StockLevel> {
  /**
   * A customer is denied whatever role they were given; everyone else is left to the permission.
   */
  manage(actor: Actor): Decision {
    return actor.realm === Realm.Customer ? Decision.Deny : Decision.Abstain;
  }
}
