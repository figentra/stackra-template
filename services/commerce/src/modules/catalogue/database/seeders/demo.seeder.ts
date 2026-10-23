/**
 * Stackra file contract:
 * Purpose: the catalogue part of the `demo` profile: one active product with two variants and one
 *          draft product.
 * Boundary: the profile is the file name and the key is `catalogue.demo`; it runs first
 *           (stackra.config.ts `e2e`), before inventory and orders. Synthetic rows from this
 *           module's factories with fixed public ids in the ADR 0231 form
 *           (`<prefix>_<26 characters>`, `01JA` plus a counter), declared once in `ids`, so docs,
 *           e2e tests and the mobile Maestro flows can name them: `mediumTee` is the M tee (barcode
 *           6281000000012, in stock), whose id the inventory and orders seeders name as data.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 20 and 24), ADR 0190 (profiles minimal, demo and
 *                     test), ADR 0231 (public ids)
 */
import { Seeder } from "@stackra/database";
import { ProductFactory } from "#modules/catalogue/database/factories/product.factory";
import { VariantFactory } from "#modules/catalogue/database/factories/variant.factory";

/** `demo-tee` sells in M and L; `demo-draft` is invisible to the public area. */
export class CatalogueDemoSeeder extends Seeder {
  /** The only place these product and variant ids are typed in this module. */
  static readonly ids = {
    tee: "prd_01JA0000000000000000000001",
    draft: "prd_01JA0000000000000000000002",
    mediumTee: "var_01JA0000000000000000000001",
    largeTee: "var_01JA0000000000000000000002",
  } as const;

  /** Writes the two products; the variants keep the ids the inventory and orders seeders name. */
  async run(): Promise<void> {
    const { ids } = CatalogueDemoSeeder;
    const medium = VariantFactory.new().state({
      id: ids.mediumTee,
      sku: "TEE-M",
      barcode: "6281000000012",
    });
    const large = VariantFactory.new().state({
      id: ids.largeTee,
      sku: "TEE-L",
      barcode: "6281000000029",
    });
    await ProductFactory.new().has(medium).has(large).create({ id: ids.tee, slug: "demo-tee" });
    await ProductFactory.new().draft().create({ id: ids.draft, slug: "demo-draft" });
  }
}
