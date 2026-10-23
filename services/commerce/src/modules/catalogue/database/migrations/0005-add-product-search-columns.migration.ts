/**
 * Stackra file contract:
 * Purpose: expand step: the hybrid search columns the Product model's `@Searchable` facet needs: a
 *          weighted tsvector per locale (`search_vector_en`, `search_vector_ar`) and the folded
 *          text the trigram index reads for prefix typing at the POS (`search_text`).
 * Boundary: a frozen snapshot written by `stackra db diff` after the model gained `@Searchable`.
 *           `searchable` is the facet's partner macro from @stackra/search, called with literal
 *           field lists, never with the model, so a later change to the facet cannot change this
 *           file; gen fails if the macro's output differs from the facet's columns. Using a
 *           package's macro orders this migration after that package's migrations. The columns'
 *           indexes are 0006; the backfill is the search package's reindex job, never a migration.
 *           No `down()`: gen derives the dev inverse.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 6 and 13, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0159 (as amended: macros), ADR 0221 (Postgres hybrid
 *                     search)
 */
import { type Blueprint, Migration, type SchemaBuilder } from "@stackra/database";

/** The text and filter fields of `@Searchable`, as literals. */
export class AddProductSearchColumnsMigration extends Migration {
  /** Adds the search columns for the declared fields and filters. */
  up(schema: SchemaBuilder): void {
    schema.table("products", (t: Blueprint) => {
      t.searchable({
        text: ["title", "description", "variants.sku", "variants.barcode"],
        filters: ["status", "collections.slug"],
      });
    });
  }
}
