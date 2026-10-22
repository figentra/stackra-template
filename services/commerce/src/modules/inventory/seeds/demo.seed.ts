/**
 * Stackra file contract:
 * Purpose: the inventory part of the `demo` profile: 50 units of the M tee, none of the L tee.
 * Boundary: synthetic rows from this module's factory; its stock ids are declared once in
 *           `InventoryDemoSeeder.ids`. The variant ids are catalogue's seeded public ids, named as
 *           data, never imported: a sibling module's seeder is not a declaration file. Seeder key
 *           `inventory.demo`.
 * Runtime: node
 * Governing contract: ADR 0190, ADR 0231 (public ids), guides/programming-model.mdx#seeds
 */
import { Seeder, type SeedContext } from "@stackra/database";
import { StockLevelFactory } from "#modules/inventory/factories/stock-level.factory";

/** The storefront shows the L tee (`var_01JA0000000000000000000002`) out of stock. */
export class InventoryDemoSeeder extends Seeder {
  /** The profiles this seeder belongs to. */
  static readonly profiles = ["demo"] as const;

  /** The only place these stock-level ids are typed. */
  static readonly ids = {
    mediumTee: "stk_01JA0000000000000000000001",
    largeTee: "stk_01JA0000000000000000000002",
  } as const;

  /** Writes one stock row per seeded variant at the main location. */
  async run({ em }: SeedContext): Promise<void> {
    const { ids } = InventoryDemoSeeder;
    const levels = new StockLevelFactory(em);
    await levels.createOne({
      id: ids.mediumTee,
      variantId: "var_01JA0000000000000000000001",
      onHand: 50,
    });
    await levels.createOne({
      id: ids.largeTee,
      variantId: "var_01JA0000000000000000000002",
      onHand: 0,
    });
  }
}
