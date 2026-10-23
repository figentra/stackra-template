/**
 * Stackra file contract:
 * Purpose: expand step: the storefront fields of a product (description, images, collections, seo)
 *          and the option values of a variant.
 * Boundary: a frozen snapshot written by `stackra db diff` after the models gained those fields;
 *           literals only. Additive: every column is nullable or has a constant default equal to
 *           the model's initializer, so there is no backfill and no contract step. The translated
 *           description uses the `translatable` macro, so its columns match the Translatable trait.
 *           No `down()`: gen derives the dev inverse.
 * Runtime: node
 * Governing contract: ADR 0294 (decision 13, as amended by programming model v3.1, AGENTS.md),
 *                     ADR 0159 (as amended: expand and contract)
 */
import { type Blueprint, Migration, type SchemaBuilder } from "@stackra/database";

/** No images, no collections, no seo and no options until a merchant sets them. */
export class AddStorefrontFieldsMigration extends Migration {
  /** Adds the storefront columns, every one nullable or defaulted. */
  up(schema: SchemaBuilder): void {
    schema.table("products", (t: Blueprint) => {
      t.translatable(["description"]).nullable();
      t.jsonb("images").default([]);
      t.jsonb("collections").default([]);
      t.jsonb("seo").nullable();
    });
    schema.table("variants", (t: Blueprint) => {
      t.jsonb("options").default({});
    });
  }
}
