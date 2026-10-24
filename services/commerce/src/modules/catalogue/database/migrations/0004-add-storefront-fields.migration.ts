/**
 * Stackra file contract:
 * Purpose: expand step: the storefront fields of a product (description, images, seo) and the
 *          option values of a variant.
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

/** No images, no seo and no options until a merchant sets them. */
export class AddStorefrontFieldsMigration extends Migration {
  /** Adds the storefront columns, every one nullable or defaulted. */
  up(schema: SchemaBuilder): void {
    schema.table("products", (t: Blueprint) => {
      t.translatable(["description"])
        .nullable()
        .comment(
          "Rich-text document (L2) per locale for the storefront page; null until one is written.",
        );
      t.jsonb("images")
        .notNull()
        .default([])
        .comment("Storefront images in display order; the first is the card image.");
      t.jsonb("seo")
        .nullable()
        .comment(
          "Merchant overrides of the page title and meta description; null derives both from it.",
        );
    });
    schema.table("variants", (t: Blueprint) => {
      t.jsonb("options")
        .notNull()
        .default({})
        .comment(
          'Option values that tell variants apart (`{ size: "M", colour: "navy" }`), for the picker.',
        );
    });
  }
}
