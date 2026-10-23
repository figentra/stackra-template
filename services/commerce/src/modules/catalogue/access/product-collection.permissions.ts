/**
 * Stackra file contract:
 * Purpose: the permissions of the product collection model: `catalogue.product_collection.<verb>`,
 *          each with its risk.
 * Boundary: statics only; the value is the risk and nothing else. Names are derived from the
 *           module, the class (minus `Permissions`) and the static. The generated operations of
 *           ProductCollectionResource bind by verb (`read` for the list, `create`, `update`).
 *           Labels are the derived i18n keys `catalogue::permissions.product_collection.<verb>`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 16 and 20), ADR 0132, ADR 0208 (names), ADR 0099 (risk)
 */
import { Permission, Permissions } from "@stackra/iam";

/** Storefronts read collections only through the products listed in them. */
export class ProductCollectionPermissions extends Permissions {
  /** See the collections in the console; L0. */
  static readonly read = Permission.L0;

  /** Create a collection (the generated `catalogue.product_collection.create`). */
  static readonly create = Permission.L1;

  /** Rename a collection or change its slug (the generated update). */
  static readonly update = Permission.L1;
}
