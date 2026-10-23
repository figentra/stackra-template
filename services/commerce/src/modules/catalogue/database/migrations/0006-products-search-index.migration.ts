/**
 * Stackra file contract:
 * Purpose: the hybrid search indexes of `catalogue.products`: one GIN index per locale's tsvector,
 *          and the accent-insensitive trigram index for prefix typing at the POS.
 * Boundary: a frozen snapshot written by `stackra db diff` (the two tsvector indexes) plus the
 *           trigram expression index added by hand before the first commit; literals only. The
 *           expression calls `search.unaccent_immutable(text)`, a function @stackra/search creates
 *           in its own migration, so `after` names that migration by its typed id from
 *           `#stackra/migrations`; gen parses the raw SQL and fails without that edge. A blueprint
 *           cannot express an operator class, so the expression index is `schema.sql` with its
 *           hand-written `inverse`. Online: every statement is a concurrent build on the live
 *           table, so the compiler emits three single-statement, non-transactional steps; writes
 *           continue throughout. No `down()`: gen derives the inverse of the two blueprint indexes
 *           and uses the stated one for the raw step.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 6 and 13, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0159 (as amended: online operations, dependencies, raw
 *                     SQL), ADR 0160 (approved extensions), ADR 0221 (Postgres hybrid search)
 */
import { type Blueprint, Migration, type SchemaBuilder } from "@stackra/database";
import { Migrations } from "#stackra/migrations";

/** Needs `search.unaccent_immutable(text)` from @stackra/search. */
export class ProductsSearchIndexMigration extends Migration({
  after: [Migrations.search.createTextFunctions],
}) {
  /** Builds the three search indexes while writes continue. */
  up(schema: SchemaBuilder): void {
    schema.table("products", (t: Blueprint) => {
      t.index(["search_vector_en"]).using("gin").concurrently();
      t.index(["search_vector_ar"]).using("gin").concurrently();
    });
    schema.sql(
      "CREATE INDEX CONCURRENTLY idx_products_search_text_trgm ON catalogue.products " +
        "USING gin (search.unaccent_immutable(search_text) gin_trgm_ops)",
      { inverse: "DROP INDEX CONCURRENTLY IF EXISTS catalogue.idx_products_search_text_trgm" },
    );
  }
}
