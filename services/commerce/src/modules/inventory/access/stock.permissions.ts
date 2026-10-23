/**
 * Stackra file contract:
 * Purpose: the permissions of stock: `inventory.stock.<verb>`, each with its risk.
 * Boundary: statics only; the value is the risk and nothing else. People are granted "stock", not
 *           "stock level", so the class names the resource (`StockPermissions` → `stock`) rather
 *           than the model. Stock is L1 even to read, because levels are commercially sensitive.
 *           StockPolicy refines `manage` per record. Labels are the derived i18n keys
 *           `inventory::permissions.stock.<verb>`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 16 and 20), ADR 0132, ADR 0208 (names), ADR 0099 (risk)
 */
import { Permission, Permissions } from "@stackra/iam";

/** Referenced as `StockPermissions.read` by the low-stock broadcast and query. */
export class StockPermissions extends Permissions {
  /** See stock levels and receive the low-stock refresh. */
  static readonly read = Permission.L1;

  /** Set on-hand units after a count or a delivery; L2, so StockPolicy#manage refines it. */
  static readonly manage = Permission.L2;
}
