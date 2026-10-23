/**
 * Stackra file contract:
 * Purpose: the hybrid search indexes of `catalogue.products` (one per locale's tsvector and the
 *          trigram index for prefix typing at the POS), in their own migration because a
 *          concurrent build cannot run inside a transaction.
 * Boundary: written by `stackra db diff` after the model gained `@Searchable`, reviewed, then
 *           committed and never edited. `searchIndexes` is the @stackra/search macro over the
 *           columns 0005 added, so the indexes always match the facet. `concurrently()` makes the
 *           compiler emit them outside a transaction, so writes continue while they build on the
 *           live table. Forward only.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 6 and 13), ADR 0159 (as amended: concurrent index builds
 *                     in their own migration), ADR 0221 (Postgres hybrid search)
 */
import { type Blueprint, Migration } from "@stackra/database";
import { Products } from "#stackra/tables";
import { Product } from "#modules/catalogue/models/product.model";

/** Reads the text and filter fields from the model's `@Searchable` facet. */
export class ProductsSearchIndexMigration extends Migration {
  /** Builds the search indexes while writes continue; the build cannot share a transaction. */
  up(schema: Blueprint): void {
    schema.table(Products, (t) => t.searchIndexes(Product).concurrently());
  }
}
