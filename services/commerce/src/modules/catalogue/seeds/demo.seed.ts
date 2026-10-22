/**
 * Stackra file contract:
 * Purpose: the catalogue part of the `demo` profile: one Active product with two variants and one
 *          draft product.
 * Boundary: synthetic rows from this module's factories with fixed public ids in the ADR 0231 form
 *           (`01JA` plus a counter), declared once in `CatalogueDemoSeeder.ids`, so docs, e2e tests
 *           and the mobile Maestro flows can name them: `mediumTee` is the M tee (barcode
 *           6281000000012, in stock). Seeder key `catalogue.demo`; it runs before inventory and
 *           orders (module order).
 * Runtime: node
 * Governing contract: ADR 0190 (profiles minimal, demo, test), ADR 0231 (public ids),
 *                     guides/programming-model.mdx#seeds
 */
import { Seeder, type SeedContext } from "@stackra/database";
import { ProductFactory } from "#modules/catalogue/factories/product.factory";
import { VariantFactory } from "#modules/catalogue/factories/variant.factory";

/** `demo-tee` sells in M and L; `demo-draft` is invisible to the public area. */
export class CatalogueDemoSeeder extends Seeder {
  /** The profiles this seeder belongs to. */
  static readonly profiles = ["demo"] as const;

  /** The only place these product and variant ids are typed in this module. */
  static readonly ids = {
    tee: "prd_01JA0000000000000000000001",
    draft: "prd_01JA0000000000000000000002",
    mediumTee: "var_01JA0000000000000000000001",
    largeTee: "var_01JA0000000000000000000002",
  } as const;

  /** Writes the two products; the variants keep the ids the inventory and orders seeds name. */
  async run({ em }: SeedContext): Promise<void> {
    const { ids } = CatalogueDemoSeeder;
    await new ProductFactory(em)
      .has(VariantFactory, 1, { id: ids.mediumTee, sku: "TEE-M", barcode: "6281000000012" })
      .has(VariantFactory, 1, { id: ids.largeTee, sku: "TEE-L", barcode: "6281000000029" })
      .createOne({ id: ids.tee, slug: "demo-tee" });
    await new ProductFactory(em).state("draft").createOne({ id: ids.draft, slug: "demo-draft" });
  }
}
