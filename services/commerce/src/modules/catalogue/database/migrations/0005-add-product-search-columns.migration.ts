/**
 * Stackra file contract:
 * Purpose: expand step: the hybrid search columns the Product model's `@Searchable` needs (a
 *          weighted tsvector per locale and the text the trigram index reads for prefix typing at
 *          the POS).
 * Boundary: written by `stackra db diff` after the model gained `@Searchable`, reviewed, then
 *           committed and never edited. `searchColumns` is the @stackra/search macro, so the
 *           columns always match the facet. Their indexes are 0006, built concurrently in their
 *           own migration; the backfill is the search package's reindex job, never a migration.
 *           Forward only.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 6 and 13), ADR 0159 (as amended), ADR 0221 (Postgres
 *                     hybrid search)
 */
import { type Blueprint, Migration } from "@stackra/database";
import { Products } from "#stackra/tables";
import { Product } from "#modules/catalogue/models/product.model";

/** Reads the text and filter fields from the model's `@Searchable` facet. */
export class AddProductSearchColumnsMigration extends Migration {
  /** Adds the search columns for the declared fields and filters. */
  up(schema: Blueprint): void {
    schema.table(Products, (t) => t.searchColumns(Product));
  }
}
