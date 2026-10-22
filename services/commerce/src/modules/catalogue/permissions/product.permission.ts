/**
 * Stackra file contract:
 * Purpose: the permissions of the `product` resource; names are `catalogue.product.<member>`.
 * Boundary: a decorated class of constants; `create` and `update` are what the `@Crud` actions bind
 *           to by verb. Risk lives here only; every action and query inherits it (ADR 0132).
 * Runtime: isomorphic
 * Governing contract: ADR 0132, ADR 0208, guides/programming-model.mdx#permissions
 */
import { Permission, Permissions, Risk } from "@stackra/iam";
import { Product } from "#modules/catalogue/models/product.model";

/** Labels default to `catalogue::permissions.product.<verb>`. */
@Permissions(Product)
export class ProductPermissions {
  /**
   * See products and variants; L0, and the public area grants it to anonymous storefront callers.
   */
  @Permission({ risk: Risk.L0 }) static readonly read: Permission;
  /** Create a product with its variants (the generated `ProductCrud.Create`). */
  @Permission({ risk: Risk.L1 }) static readonly create: Permission;
  /** Edit a product and its variants (the generated `ProductCrud.Update`). */
  @Permission({ risk: Risk.L1 }) static readonly update: Permission;
  /** Take a product off sale; L2, so ProductPolicy.archive must exist. */
  @Permission({ risk: Risk.L2 }) static readonly archive: Permission;
}
