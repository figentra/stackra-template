/**
 * Stackra file contract:
 * Purpose: the inventory part of the `demo` profile: 50 units of the M tee, none of the L tee.
 * Boundary: the profile is the file name and the key is `inventory.demo`; it runs after
 *           `catalogue.demo` (stackra.config.ts `e2e`). Synthetic rows from this module's factory,
 *           with its stock ids declared once in `ids`. The variant ids are catalogue's seeded
 *           public ids, named as data: a sibling module's seeder is not one of its public groups.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 20 and 24), ADR 0190 (profiles minimal, demo and
 *                     test), ADR 0231 (public ids)
 */
import { Seeder } from "@stackra/database";
import { StockLevelFactory } from "#modules/inventory/database/factories/stock-level.factory";

/** Catalogue's seeded M tee (`catalogue.demo`). */
const MEDIUM_TEE = "var_01JA0000000000000000000001";

/** Catalogue's seeded L tee (`catalogue.demo`). */
const LARGE_TEE = "var_01JA0000000000000000000002";

/** The storefront shows the L tee out of stock. */
export class InventoryDemoSeeder extends Seeder {
  /** The only place these stock-level ids are typed. */
  static readonly ids = {
    mediumTee: "stk_01JA0000000000000000000001",
    largeTee: "stk_01JA0000000000000000000002",
  } as const;

  /** Writes one level per seeded variant at the main location. */
  async run(): Promise<void> {
    const { ids } = InventoryDemoSeeder;
    await StockLevelFactory.new().create({ id: ids.mediumTee, variantId: MEDIUM_TEE, onHand: 50 });
    await StockLevelFactory.new().soldOut().create({ id: ids.largeTee, variantId: LARGE_TEE });
  }
}
