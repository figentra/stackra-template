/**
 * Stackra file contract:
 * Purpose: the permissions of the `stock` resource; names are `inventory.stock.<member>`.
 * Boundary: the non-model form: people are granted "stock", not "stock level", so the resource is
 *           declared by name. Stock is L1 even to read: levels are commercially sensitive.
 * Runtime: isomorphic
 * Governing contract: ADR 0132, ADR 0208, guides/programming-model.mdx#permissions
 */
import { Permission, Permissions, Risk } from "@stackra/iam";

/** Labels default to `inventory::permissions.stock.<verb>`. */
@Permissions({ resource: "stock" })
export class StockPermissions {
  /** See stock levels and receive low-stock pushes. */
  @Permission({ risk: Risk.L1 }) static readonly read: Permission;
  /** Set on-hand units after a count or delivery. */
  @Permission({ risk: Risk.L2 }) static readonly manage: Permission;
}
