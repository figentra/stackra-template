/**
 * Stackra file contract:
 * Purpose: expand step: the storefront fields of a product (description, images, collections, seo)
 *          and the option values of a variant.
 * Boundary: written by `stackra db diff` after the models gained those fields, reviewed, then
 *           committed and never edited. Every column is nullable or defaulted, so there is no
 *           backfill and no contract step. The translated description uses the trait macro, so its
 *           columns match `Translatable`. Forward only.
 * Runtime: node
 * Governing contract: ADR 0294 (decision 13), ADR 0159 (as amended: expand and contract)
 */
import { type Blueprint, Migration } from "@stackra/database";
import { Products, Variants } from "#stackra/tables";

/** The defaults equal the models' initializers: no images, no collections, no options. */
export class AddStorefrontFieldsMigration extends Migration {
  /** Adds the storefront columns, every one nullable or defaulted. */
  up(schema: Blueprint): void {
    schema.table(Products, (t) => {
      t.translatable([Products.columns.description]).nullable();
      t.jsonb(Products.columns.images).default([]);
      t.jsonb(Products.columns.collections).default([]);
      t.jsonb(Products.columns.seo).nullable();
    });
    schema.table(Variants, (t) => t.jsonb(Variants.columns.options).default({}));
  }
}
