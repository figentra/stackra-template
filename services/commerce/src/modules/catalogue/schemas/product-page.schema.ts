/**
 * Stackra file contract:
 * Purpose: `ProductPage`: one cursor page of products, the output of the `@Crud` list.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0117, guides/programming-model.mdx#schemas
 */
import { Page } from "@stackra/schema";
import { ProductView } from "#modules/catalogue/schemas/product-view.schema";

/** `{ items: ProductView[], nextCursor?, hasMore }`. */
export class ProductPage extends Page(ProductView) {}
