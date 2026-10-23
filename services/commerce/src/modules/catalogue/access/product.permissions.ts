/**
 * Stackra file contract:
 * Purpose: the permissions of the product model: `catalogue.product.<verb>`, each with its risk.
 * Boundary: statics only; the value is the risk and nothing else. Names are derived from the
 *           module, the class (minus `Permissions`) and the static. The generated operations bind
 *           by verb (`create`, `update`, `read` for the list), and every hand-written action and
 *           query inherits the risk of the permission it requires (ADR 0132). ProductPolicy refines
 *           `archive` per record. Labels are the derived i18n keys
 *           `catalogue::permissions.product.<verb>`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 16 and 20), ADR 0132, ADR 0208 (names), ADR 0099 (risk)
 */
import { Permission, Permissions } from "@stackra/iam";

/** `ProductPermissions.read` is named by the variant queries, whose keys name no product verb. */
export class ProductPermissions extends Permissions {
  /** See products and variants; L0, and the public area grants it to anonymous storefronts. */
  static readonly read = Permission.L0;

  /** Create a product with its variants (the generated `catalogue.product.create`). */
  static readonly create = Permission.L1;

  /** Edit a product and its variants (the generated update, and attaching an image). */
  static readonly update = Permission.L1;

  /** Take a product off sale; L2, so a person confirms it and ProductPolicy#archive refines it. */
  static readonly archive = Permission.L2;

  /** Import products from a CSV or XLSX file; each row still needs `create` or `update`. */
  static readonly import = Permission.L1;
}
