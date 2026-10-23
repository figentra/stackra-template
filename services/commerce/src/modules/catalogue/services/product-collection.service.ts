/**
 * Stackra file contract:
 * Purpose: the product collection's service: the reads and writes the generated operations of
 *          ProductCollectionResource run over.
 * Boundary: `CrudService<ProductCollection>` (the model is the type argument) supplies every
 *           member it needs (`find`, `page`, `create`, `update`, `table`), so the class adds none;
 *           it exists because the generated operations bind a service by class. Not exported to
 *           sibling modules. No transport and no permission checks: the pipeline does both.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 16 and 17), ADR 0105 (as amended)
 */
import { CrudService } from "@stackra/database";
import type { ProductCollection } from "#modules/catalogue/models/product-collection.model";

/** Runs inside the caller's transaction, like every CrudService. */
export class ProductCollectionService extends CrudService<ProductCollection> {}
