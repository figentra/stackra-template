/**
 * Stackra file contract:
 * Purpose: the `catalogue.product_limit` entitlement: how many products a tenant's plan allows.
 * Boundary: a declaration (`@Entitlement`, @stackra/entitlements). The plan values live in the
 *           platform's entitlements service; this class only names the limit and what it counts.
 *           ProductService's `@Crud` gates `catalogue.product.create` with it, and the web pricing
 *           page names the same entitlement. A commercial right, never a release flag.
 * Runtime: node
 * Governing contract: ADR 0213 d3 (flags are not entitlements), ADR 0127
 */
import { Entitlement, EntitlementKind } from "@stackra/entitlements";
import { I18n } from "#stackra/i18n";
import { Product } from "#modules/catalogue/models/product.model";

/** Counted per tenant over live products; creating one past the limit refuses `limit_reached`. */
@Entitlement({
  key: "product_limit",
  kind: EntitlementKind.Limit,
  counts: Product,
  label: I18n.catalogue.entitlements.product_limit,
})
export class ProductLimit {}
