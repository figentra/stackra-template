/**
 * Stackra file contract:
 * Purpose: `ProductListFilter`: cursor, limit and an optional status; the `@Crud` list query takes
 *          it.
 * Boundary: one schema class and its inferred type (ADR 0006); never the database row.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, ADR 0117, guides/programming-model.mdx#schemas
 */
import { PageFilter } from "@stackra/schema";
import { ProductStatus } from "#modules/catalogue/enums/product-status.enum";

/** Cursor, limit and an optional status; the `@Crud` list query takes it. */
export class ProductListFilter extends PageFilter({ status: ProductStatus.schema.optional() }) {}
