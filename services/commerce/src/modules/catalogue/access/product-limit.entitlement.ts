/**
 * Stackra file contract:
 * Purpose: `catalogue.product_limit`: how many products a tenant's plan allows.
 * Boundary: a commercial right, never a release flag. The plan values live in the platform's
 *           entitlements service; this class only says what kind of right it is and what it counts.
 *           The key `catalogue.product_limit` and its label key are derived. Because it counts
 *           Product, gen puts the gate on the generated `catalogue.product.create@1`, and the web
 *           pricing page names the same right.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 11, 16 and 20), ADR 0213 d3 (flags are not
 *                     entitlements), ADR 0138 (as amended: the entitlement step)
 */
import { Entitlement, EntitlementKind } from "@stackra/entitlements";
import { Product } from "#modules/catalogue/models/product.model";

/** Counted per tenant over live products; creating one past the limit refuses `limit_reached`. */
export class ProductLimitEntitlement extends Entitlement({
  kind: EntitlementKind.Limit,
  counts: () => Product,
}) {}
